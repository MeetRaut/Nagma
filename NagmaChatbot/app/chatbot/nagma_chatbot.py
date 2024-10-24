import logging
import pandas as pd
import numpy as np
import re
from datetime import datetime
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler
from rapidfuzz import process, fuzz
from .responses import responses, intents
from .utils import parse_release_date, format_release_date, extract_numeric_range

logger = logging.getLogger(__name__)

class NagmaChatbot:
    """
    A chatbot for providing music recommendations and information.
    """

    def __init__(self, data_path):
        self.df = self.load_dataset(data_path)
        self.user_preferences = {}
        self.context = {}
        self.state = None  # To keep track of the conversation state
        self.preferences = {}  # To store user preferences
        self.preference_params = []  # List of parameters to ask the user
        self.preference_index = 0  # Index to keep track of which parameter to ask next
        logger.info("NagmaChatbot initialized.")

    def load_dataset(self, path):
        try:
            self.df = pd.read_csv(path)
            logger.info(f"Dataset loaded successfully with shape: {self.df.shape}")
            logger.info(f"Columns in dataset before standardizing: {self.df.columns.tolist()}")

            # Remove special characters and standardize column names
            self.df.columns = self.df.columns.str.replace(r'[^\w]', '', regex=True).str.lower()
            logger.info(f"Dataset columns after removing special characters: {self.df.columns.tolist()}")

            # Mapping from your dataset's column names to expected column names
            column_mapping = {
                'valence': 'valence',
                'acousticness': 'acousticness',
                'artists': 'artists',
                'danceability': 'danceability',
                'energy': 'energy',
                'tempo': 'tempo',
                'name': 'name',
                'popularity': 'popularity',
                'releasedate': 'release_date',  # Note that special characters are removed
                'year': 'year',
                # Add other mappings as needed
            }
            self.df.rename(columns=column_mapping, inplace=True)
            logger.info(f"Dataset columns after renaming: {self.df.columns.tolist()}")

            expected_columns = {'valence', 'acousticness', 'danceability', 'energy', 'tempo'}
            missing_columns = expected_columns - set(self.df.columns)
            if missing_columns:
                logger.error(f"Missing columns in dataset after loading: {missing_columns}")
                logger.error(f"Available columns: {self.df.columns.tolist()}")
                return pd.DataFrame()  # Return an empty DataFrame if essential columns are missing

            # Ensure 'release_year' is in the dataset
            if 'release_date' in self.df.columns:
                self.df['release_date'] = pd.to_datetime(self.df['release_date'], errors='coerce')
                self.df = self.df.dropna(subset=['release_date'])
                self.df['release_year'] = self.df['release_date'].dt.year.astype(int)
            elif 'year' in self.df.columns:
                self.df['release_year'] = pd.to_numeric(self.df['year'], errors='coerce').astype('Int64')
                self.df = self.df.dropna(subset=['release_year'])
            else:
                logger.error("No 'release_date' or 'year' column found in the dataset.")
                return pd.DataFrame()

            logger.info(f"Number of records before filtering by year: {self.df.shape[0]}")
            self.df = self.df[self.df['release_year'] >= 1980]
            logger.info(f"Number of records after filtering by year: {self.df.shape[0]}")

            if self.df.empty:
                logger.error("The dataset is empty after filtering by release year.")
                return pd.DataFrame()

            # Convert essential columns to numeric
            for col in expected_columns:
                self.df[col] = pd.to_numeric(self.df[col], errors='coerce')

            # Drop rows with NaN values in essential columns
            self.df.dropna(subset=expected_columns, inplace=True)

            logger.info(f"DataFrame shape after cleaning: {self.df.shape}")
            return self.df.reset_index(drop=True)

        except FileNotFoundError:
            logger.error(f"Error: The file at {path} was not found.")
            return pd.DataFrame()
        except pd.errors.ParserError as e:
            logger.error(f"Error parsing CSV: {e}")
            return pd.DataFrame()
        except Exception as e:
            logger.error(f"An unexpected error occurred during dataset loading: {e}", exc_info=True)
            return pd.DataFrame()

    def get_artist_stats(self, artist_name):
        """
        Retrieves statistics and information about a specific artist.

        Parameters:
            artist_name (str): Name of the artist.

        Returns:
            dict or str: Dictionary containing artist stats or an error message.
        """
        # Clean and standardize artist_name
        artist_name = artist_name.strip().lower()

        # Ensure 'artists' column is properly cleaned
        artist_songs = self.df[self.df['artists'].str.contains(artist_name, case=False, na=False)]

        if artist_songs.empty:
            logger.warning(f"No songs found for artist: {artist_name}")
            return f"I couldn't find any songs by {artist_name} in my database."

        stats = {
            'total_songs': len(artist_songs),
            'avg_popularity': artist_songs['popularity'].mean() if 'popularity' in self.df.columns else None,
            'most_recent': artist_songs['release_date'].max() if 'release_date' in self.df.columns else None,
        }

        feature_stats = {}
        for feature in ['valence', 'energy', 'danceability', 'tempo', 'acousticness', 'instrumentalness', 'speechiness', 'loudness']:
            if feature in self.df.columns:
                feature_stats[feature] = {
                    'mean': artist_songs[feature].mean(),
                    'min': artist_songs[feature].min(),
                    'max': artist_songs[feature].max()
                }

        return {'basic_stats': stats, 'feature_stats': feature_stats}

    def format_artist_info(self, artist_info, artist_name):
        """
        Formats artist statistics into a readable string.

        Parameters:
            artist_info (dict or str): Artist statistics or error message.
            artist_name (str): Name of the artist.

        Returns:
            str: Formatted artist information.
        """
        if isinstance(artist_info, str):
            return artist_info  # Return the error message

        basic_stats = artist_info['basic_stats']
        feature_stats = artist_info['feature_stats']

        response = f"Here's what I know about {artist_name}:\n"
        response += f"- **Total songs in the database**: {basic_stats['total_songs']}\n"

        if basic_stats['avg_popularity'] is not None:
            response += f"- **Average popularity**: {basic_stats['avg_popularity']:.2f}/100\n"

        if basic_stats['most_recent'] is not None and pd.notnull(basic_stats['most_recent']):
            response += f"- Most recent release: {format_release_date(basic_stats['most_recent'])}\n"

        response += "\nMusical features:\n"
        for feature, stats in feature_stats.items():
            response += f"- **{feature.capitalize()}**:\n"
            response += f"  Average: {stats['mean']:.2f}\n"
            response += f"  Range: {stats['min']:.2f} - {stats['max']:.2f}\n"

        return response

    def recommend_songs(self):
        # For demonstration purposes, let's recommend the top 5 popular songs
        if 'popularity' in self.df.columns:
            top_songs = self.df.sort_values(by='popularity', ascending=False).head(5)
            response = "Here are some song recommendations:\n"
            for _, song in top_songs.iterrows():
                response += f"- {song['name']} by {song['artists']}\n"
            return response
        else:
            return "Sorry, I don't have popularity data to make recommendations."

    def collect_preferences(self, user_input):
        current_param = self.preference_params[self.preference_index]
        try:
            if current_param == 'year':
                self.preferences[current_param] = int(user_input.strip())
            elif current_param == 'tempo':
                # Handle tempo as a BPM value (expecting realistic BPM values like 60-180)
                tempo_value = float(user_input.strip())
                if 40 <= tempo_value <= 250:  # Acceptable BPM range, can be adjusted
                    self.preferences[current_param] = tempo_value
                else:
                    return "Please enter a realistic tempo value (e.g., 60-180 BPM)."
            else:
                value = float(user_input.strip())
                if 0 <= value <= 1:
                    self.preferences[current_param] = value
                else:
                    return f"Please enter a number between 0 and 1 for {current_param}."
        except ValueError:
            return f"Please enter a valid number for {current_param}."

        # Move to the next parameter
        self.preference_index += 1
        if self.preference_index < len(self.preference_params):
            next_param = self.preference_params[self.preference_index]
            param_explanation = self.get_parameter_explanation(next_param)
            if next_param == 'tempo':
                return f"{param_explanation}\nWhat **{next_param}** value do you prefer? (Enter a number, e.g., 60-180 BPM)"
            else:
                return f"{param_explanation}\nWhat **{next_param}** value do you prefer? (Enter a number between 0 and 1)"
        else:
            self.state = None
            return self.recommend_songs_based_on_preferences()

    def get_parameter_explanation(self, param):
        explanations = {
            'valence': (
                "Valence describes the musical positiveness conveyed by a track. "
                "High valence sounds more positive (happy, cheerful), while low valence sounds more negative (sad, angry)."
            ),
            'acousticness': (
                "Acousticness measures how acoustic a song is. Higher values indicate more acoustic sounds."
            ),
            'danceability': (
                "Danceability describes how suitable a track is for dancing based on tempo, rhythm stability, beat strength, and overall regularity."
            ),
            'energy': (
                "Energy represents a perceptual measure of intensity and activity. Energetic tracks feel fast, loud, and noisy."
            ),
            'tempo': (
                "Tempo is the speed of the song measured in beats per minute (BPM). Please enter your preferred tempo as a number."
            ),
            # Remove 'year' if not needed
        }
        return explanations.get(param, "")

    def recommend_songs_based_on_preferences(self):
        df_filtered = self.df.copy()
        expected_columns = ['valence', 'acousticness', 'danceability', 'energy', 'tempo']

        # Check if expected columns are present
        missing_columns = [col for col in expected_columns if col not in df_filtered.columns]
        if missing_columns:
            logger.error(f"Missing columns in dataset: {missing_columns}")
            return "Sorry, the dataset does not have the necessary information to recommend songs based on your preferences."

        try:
            logger.info(f"Using preferences for song recommendation: {self.preferences}")

            for param, value in self.preferences.items():
                if value is None:
                    logger.warning(f"Preference '{param}' is not set. Skipping filtering for this parameter.")
                    continue

                if param == 'tempo':
                    # Use a tolerance for tempo based on BPM
                    tolerance = 10  # Adjust as needed
                    min_value = max(0, value - tolerance)
                    max_value = value + tolerance
                    if 'tempo' in df_filtered.columns:
                        df_filtered = df_filtered[(df_filtered['tempo'] >= min_value) & (df_filtered['tempo'] <= max_value)]
                    else:
                        logger.warning(f"'tempo' not found in dataset columns. Skipping filtering by tempo.")
                else:
                    # Use a tolerance for other parameters
                    tolerance = 0.1
                    min_value = max(0, value - tolerance)
                    max_value = min(1, value + tolerance)

                    # Check if the parameter exists in the DataFrame
                    if param not in df_filtered.columns:
                        logger.warning(f"Parameter '{param}' not found in dataset columns. Skipping...")
                        continue

                    df_filtered = df_filtered[(df_filtered[param] >= min_value) & (df_filtered[param] <= max_value)]

            if df_filtered.empty:
                return "Sorry, I couldn't find any songs matching your preferences."
            else:
                # Sort by popularity if available
                if 'popularity' in df_filtered.columns:
                    top_songs = df_filtered.sort_values(by='popularity', ascending=False).head(5)
                else:
                    top_songs = df_filtered.head(5)
                response = "Here are some songs that match your preferences:\n"
                for _, song in top_songs.iterrows():
                    response += f"- \"{song['name']}\" by {song['artists']}\n"
                return response

        except Exception as e:
            logger.error(f"Error during song recommendation: {e}", exc_info=True)
            return "Sorry, an error occurred while trying to recommend songs."

    def get_song_information(self, song_name, artist_name=None):
        """
        Retrieves information about a specific song, optionally by a specific artist.

        Parameters:
            song_name (str): Name of the song.
            artist_name (str, optional): Name of the artist.

        Returns:
            str: Formatted song information or an error message.
        """
        # Clean the song name
        song_name = song_name.strip().lower()

        # Filter the dataset by song name
        song_matches = self.df[self.df['name'].str.lower() == song_name]

        if artist_name:
            # Clean the artist name
            artist_name = artist_name.strip().lower()
            # Further filter by artist name
            song_matches = song_matches[song_matches['artists'].str.lower().str.contains(artist_name)]

        if song_matches.empty:
            if artist_name:
                return f"Sorry, I couldn't find the song '{song_name}' by '{artist_name}'."
            else:
                return f"Sorry, I couldn't find any information about the song '{song_name}'."

        # If multiple matches, select the most popular one
        if 'popularity' in song_matches.columns:
            song = song_matches.sort_values(by='popularity', ascending=False).iloc[0]
        else:
            song = song_matches.iloc[0]

        # Format the song information
        response = f"Here's some information about '{song['name']}' by {song['artists']}:\n"
        if 'release_date' in song and pd.notnull(song['release_date']):
            response += f"- Release date: {format_release_date(song['release_date'])}\n"
        if 'popularity' in song and pd.notnull(song['popularity']):
            response += f"- Popularity: {song['popularity']}/100\n"
        if 'duration_ms' in song and pd.notnull(song['duration_ms']):
            duration_minutes = song['duration_ms'] / 60000  # Convert milliseconds to minutes
            response += f"- Duration: {duration_minutes:.2f} minutes\n"
        # Include other features if desired
        features = ['valence', 'energy', 'danceability', 'tempo', 'acousticness', 'instrumentalness', 'speechiness', 'loudness']
        response += "\nMusical features:\n"
        for feature in features:
            if feature in song and pd.notnull(song[feature]):
                response += f"- {feature.capitalize()}: {song[feature]}\n"
        return response

    def get_trending_songs(self, num_songs=5):
        """
        Retrieves a list of trending songs based on popularity and recent release date.
        If no recent songs are found, returns the most popular songs of all time.

        Parameters:
            num_songs (int): The number of trending songs to return.

        Returns:
            tuple: (list of dict, bool) A list of song information and a flag indicating if these are recent songs.
        """
        if 'popularity' not in self.df.columns or 'release_date' not in self.df.columns:
            return "Sorry, I don't have enough data to determine trending songs.", False

        # Ensure 'release_date' is in datetime format
        if not pd.api.types.is_datetime64_any_dtype(self.df['release_date']):
            self.df['release_date'] = pd.to_datetime(self.df['release_date'], errors='coerce')
            self.df = self.df.dropna(subset=['release_date'])

        # Filter songs released in the last month
        one_month_ago = datetime.now() - pd.DateOffset(months=1)
        recent_songs = self.df[self.df['release_date'] >= one_month_ago]

        if not recent_songs.empty:
            # Sort the recent songs by popularity
            trending_songs = recent_songs.sort_values(by='popularity', ascending=False).head(num_songs)
            recent = True
        else:
            # No recent songs found, return the most popular songs of all time
            trending_songs = self.df.sort_values(by='popularity', ascending=False).head(num_songs)
            recent = False

        # Prepare the list of songs to return
        song_list = []
        for _, song in trending_songs.iterrows():
            song_info = {
                'name': song['name'],
                'artists': song['artists'],
                'popularity': song['popularity']
            }
            song_list.append(song_info)

        return song_list, recent

    def get_response(self, user_input: str, user_id: str = None) -> str:
        """
        Processes user input and returns an appropriate response.
        """
        user_input_lower = user_input.lower()

        for intent_name, phrases in intents.items():
            for phrase in phrases:
                if phrase in user_input_lower:
                    if intent_name == 'song_information':
                        # Extract the song name and artist name
                        # Remove the phrase from the input
                        query = user_input_lower.replace(phrase, '').strip()
                        # Use regular expression to extract song and artist names
                        match = re.match(r"(?P<song>.+?) by (?P<artist>.+)", query)
                        if match:
                            song_name = match.group('song').strip()
                            artist_name = match.group('artist').strip()
                        else:
                            # If 'by' is not present, assume only song name is given
                            song_name = query.strip()
                            artist_name = None
                        # Call the updated get_song_information method
                        song_info = self.get_song_information(song_name, artist_name)
                        return song_info

                    elif intent_name == 'trending_songs':
                        # Handle trending songs request
                        trending_songs, recent = self.get_trending_songs()
                        if isinstance(trending_songs, str):
                            # If an error message is returned
                            return trending_songs
                        if recent:
                            response = "Here are the current trending songs:\n"
                        else:
                            response = "No recent songs found in the database. Here are the most popular songs of all time:\n"
                        for song in trending_songs:
                            response += f"- \"{song['name']}\" by {song['artists']} (Popularity: {song['popularity']})\n"
                        return response

                    elif intent_name == 'artist_information':
                        # Handle artist information
                        artist_name = user_input_lower.replace(phrase, '').strip()
                        # Clean the artist name
                        artist_name = re.sub(r'[^\w\s]', '', artist_name)
                        artist_info = self.get_artist_stats(artist_name)
                        response = self.format_artist_info(artist_info, artist_name)
                        return response

                    elif intent_name == 'recommend_songs':
                        # Start collecting preferences
                        self.preferences = {}
                        self.state = 'collecting_preferences'
                        self.preference_params = ['valence', 'acousticness', 'danceability', 'energy', 'tempo']
                        self.preference_index = 0
                        # Get the explanation for the first parameter
                        first_param = self.preference_params[0]
                        param_explanation = self.get_parameter_explanation(first_param)
                        if first_param == 'tempo':
                            return (
                                "Sure! Let's find songs based on your preferences.\n"
                                f"{param_explanation}\nWhat **{first_param}** value do you prefer? (Enter a number, e.g., 60-180 BPM)"
                            )
                        else:
                            return (
                                "Sure! Let's find songs based on your preferences.\n"
                                f"{param_explanation}\nWhat **{first_param}** value do you prefer? (Enter a number between 0 and 1)"
                            )
                    # Add more intent handling here as needed

        # Check if we're collecting preferences
        if self.state == 'collecting_preferences':
            return self.collect_preferences(user_input)

        # Fallback response using the responses dictionary
        matched_intent, score, _ = process.extractOne(
            user_input, responses.keys(), scorer=fuzz.token_set_ratio
        )
        if score >= 70:
            return responses[matched_intent]

        return "I'm not sure what you're asking. Could you rephrase your question?"

    def run(self):
        """
        Starts the chatbot interaction loop.
        """
        print("Welcome to the Nagma Music Chatbot!")
        print("I can help you with:")
        print("- Latest trending songs")
        print("- Recommending songs of your taste")
        print("- Getting artist statistics")
        print("- Finding information about Songs")
        print("- Release date information")
        print("And more! Type 'exit' to end the chat.")

        while True:
            user_input = input("You: ")
            if user_input.lower() == 'exit':
                print("Chatbot: Goodbye!")
                break
            response = self.get_response(user_input)
            print("Chatbot:", response)
