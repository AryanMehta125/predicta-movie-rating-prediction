# Contributing to Predicta

Thank you for your interest in contributing to Predicta!

## Getting Started

1. Fork the repository
2. Clone your fork

```bash
git clone https://github.com/your-username/predicta-movie-rating-prediction.git
```

3. Install frontend dependencies

```bash
cd frontend
npm install
```

4. Install backend dependencies

```bash
cd ../backend
pip install -r requirements.txt
```

## Environment Variables

Create:

### backend/.env

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=predicta
```

### frontend/.env

```env
REACT_APP_BACKEND_URL=http://127.0.0.1:8000
```

## Running the Project

Backend:

```bash
uvicorn server:app --reload
```

Frontend:

```bash
npm start
```

## Contribution Guidelines

We welcome contributions of all sizes, including:

* Bug fixes
* UI/UX improvements
* Performance optimizations
* Machine Learning model improvements
* New analytics and visualization features
* API enhancements
* Documentation improvements
* Testing and quality assurance

Contributors are also encouraged to extend the platform with entirely new features and ideas that can help Predicta evolve into a larger and more scalable movie intelligence platform.

If you build something interesting, feel free to open a Pull Request and share your approach with the community.

## Reporting Issues

Please open a GitHub Issue with:

* Steps to reproduce
* Expected behavior
* Actual behavior
* Screenshots (if applicable)

## Future Expansion Ideas

Some areas where contributors can help:

* TMDB / IMDb API integration
* User authentication
* Personal prediction history
* Recommendation engine
* Real-time movie trends
* Advanced sentiment analysis
* Model retraining pipeline
* Cloud deployment templates
* Mobile application support

Thank you for helping improve Predicta and contributing to the open-source community!
