from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient

from app import app

client = TestClient(app)


def test_health():
    response = client.get('/health')
    assert response.status_code == 200
    assert response.json()['status'] == 'ok'


def test_predict_legitimate_or_phishing():
    response = client.post('/predict', json={'text': 'Please verify your account immediately by clicking here to confirm.'})
    assert response.status_code == 200
    payload = response.json()
    assert payload['prediction'] in {'phishing', 'legitimate'}
    assert 0 <= payload['confidence'] <= 1
    assert 'explanation' in payload
    assert 'suspicious_links' in payload


def test_predict_extracts_links():
    response = client.post(
        '/predict',
        json={'text': 'Urgent action required. Please review the link: https://example.com/login to secure your account.'},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload['suspicious_links']
    assert payload['suspicious_links'][0]['url'] == 'https://example.com/login'


def test_url_analysis():
    response = client.post('/analyze-url', json={'url': 'https://login-example-security.com/verify'})
    assert response.status_code == 200
    payload = response.json()
    assert 'overall_risk' in payload
