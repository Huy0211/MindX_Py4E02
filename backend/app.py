from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

# Load dữ liệu từ CSV
def load_data():
    csv_path = os.path.join(os.path.dirname(__file__), '../data/player_statistics_cleaned_final.csv')
    return pd.read_csv(csv_path)

# Trang chủ - Load HTML
@app.route('/')
def serve_frontend():
    return send_from_directory('../frontend', 'index.html')

# Load CSS, JS
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('../frontend', path)

# Lấy toàn bộ player
@app.route('/api/players')
def get_all_players():
    df = load_data()
    return jsonify(df.to_dict('records'))

# Lấy top players theo metric
@app.route('/api/top-players/<metric>')
def get_top_players(metric):
    df = load_data()
    
    metric_map = {
        'winrate': 'Win rate',
        'kda': 'KDA',
        'kp': 'KP%',
        'dpm': 'DPM',
        'gpm': 'GoldPerMin'
    }
    
    if metric not in metric_map:
        return jsonify({'error': 'Metric not found'}), 404
    
    column = metric_map[metric]
    top_players = df.nlargest(5, column)[['PlayerName', 'TeamName', 'Position', column]]
    return jsonify(top_players.to_dict('records'))

# Lọc top player theo từng position
@app.route('/api/position/<position>/<metric>')
def get_position_stats(position, metric):
    df = load_data()
    
    metric_map = {
        'winrate': 'Win rate',
        'kda': 'KDA',
        'kp': 'KP%',
        'dpm': 'DPM'
    }
    
    if metric not in metric_map:
        return jsonify({'error': 'Metric not found'}), 404
    
    position_data = df[df['Position'] == position.capitalize()]
    if position_data.empty:
        return jsonify({'error': 'Position not found'}), 404
    
    column = metric_map[metric]
    top_players = position_data.nlargest(5, column)[['PlayerName', 'TeamName', column]]
    return jsonify(top_players.to_dict('records'))

# Lấy danh sách position để lọc
@app.route('/api/positions')
def get_positions():
    df = load_data()
    positions = df['Position'].unique().tolist()
    return jsonify(positions)

if __name__ == '__main__':
    app.run(debug=True, port=5000)