Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
.\venv\Scripts\Activate.ps1    
python manage.py createsuperuser
(venv) PS D:\konovo_api> python manage.py runserver
(venv) PS D:\konovo_api\konovo_frontend> npm start
