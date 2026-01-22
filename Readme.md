# 🏭 Shop Management System

Full-stack shop application with Django REST Framework backend and React frontend.
The main goal is to showcase a scalable e-commerce template with REST API and modern React UI, which can be extended with desired components.

## 🛠️ **Tech Stack**
- **Backend:** Django 5.x, Django REST Framework, JWT Authentication, SQLite
- **Frontend:** React 18, React Router, Context API, Jest Testing
- **Authentication:** JWT tokens with hierarchical permissions (Superuser → JWT Group → Regular User)

## This README explains the application workflow - more detailed explanations are in code comments. You can track URLs to backend methods that generate API responses to frontend.

## 📁 **Project Structure**
```
two_servers/
├── 📂 api/                 # Django REST API
├── 📂 shop/                # Shop models & views  
├── 📂 backend/             # Django settings
├── 📂 frontend/src/        # React application
├── 📂 media/               # Uploaded files
└── 📄 manage.py            # Django entry point
```

**Comprehensive test suites included** with detailed explanations for both Django and React.

## 🏃‍♀️‍➡️🏁 **Quick Start**

### Prerequisites
- Python 3.12+
- Node.js 18+
- Git

### Installation & Running
```bash
# Backend (Django)
cd two_servers
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver  # Runs on http://localhost:8000

# Frontend (React) - New terminal
cd frontend
npm install
npm start  # Runs on http://localhost:3000
```

### Default Users
  in Django admin panel you can promote user to be in JWT group

## **Features**
- 🔐 JWT-based authentication with hierarchical permissions
- 🛍️ Product management with image uploads
- 👥 User management (admin panel)
- ⚖️ Role-based access control (Superuser → JWT Group → Regular)
- 📱 Responsive React frontend
- 🧑‍🔬🔬 Comprehensive test coverage
- 🔄 Auto-token refresh with CSRF protection

## 👷🚧🏭 **Application Architecture**
The client is served a rendered page by the frontend server and sees:
  ### Layout.js
Navbar:
  Renders hyperlinks to components at the top of the screen:

    Login.js → Form with username and password
    Logout.js → Resets all user data and clears tokenStore
    Products.js → Displays product groups, clicking navigates to products within the group
    Shop.js → Returns to the homepage showing product groups

Administration:

  Panel visible only to users in the JWT group or to superusers

Outlet:

    Renders selected component in the middle of the screen

  ### Login.js
  Defines input placeholders for:

    username → sent to backend: /api/auth/login/ → handled by LoginView and LoginSerializer
    password → same flow

  Login logic:

    If the user is a superuser or in the JWT group:
    → Backend returns access and refresh tokens

  User types:

    login → user with JWT group membership
    loginSession → user without JWT group membership

  User data is stored in AuthContext.js and tokenStore.js.
  
  ### Logininfo.jsx
Displays:

    User info fetched from AuthContext.jsx via /api/auth/me/
    Fields shown:

      user → from refreshUser or loginSession
      loading → boolean from AuthContext.jsx while waiting for response
      role → user's role
      jwt → token

 + Includes Logout button that resets all user data and clears the token.

  ### Products.js
  Renders:

    Product groups by ID → fetched from backend via shop.router: ProductGroupViewSet 
    ⬇️
    On click → navigates to:
    ⬇️
    Products in the selected group → fetched from: ProductViewSet

  ### Shop  same as Products but this one is button
        Same behavior as Products.js, but triggered via a button instead of component route.up

  ### Administration.js
Visible only to:

  Superusers +  JWT group members

For superusers:

  UsersCRUD

  Renders:
  input fields for:
   username, email, password
  Add User button:
   sends POST request --> shop.router UserViewSet

  ProductsCRUD

  Renders:
    All products and prices

    Edit Price button:
     sets edit Id and new price

    Save button:
     sends PATCH request to update price

  Delete button:
   sends DELETE request --> shop.routers ProductViewSet

  Add Product form:
   Accepts product info and image
   On submit:
    sends POST request with form data --> shop.routers ProductViewSet 

  For JWT users:

  Can access ProductsCRUD

## 🛠️⚙️ **Core Utilities**

  ### AuthContext

  Manages current user state and related functions.

    Data:

      user --> username and password
      token --> JWT token
      loading --> True or False --> when waiting for response

    Functions:

      refreshUser() --> refreshing user and token
      login() --> for user with JWT token
      loginSession() --> for user without JWT token
      logout() --> clears all data

  ### tokenStore.js

    Handles storage of tokens.

  ### ProtectedRoutes.js

    Checks user data; automatically redirects to the home page if access is unauthorized.

  ### Api.js

    Sets CSRF token using getCookie()
    Includes CSRF token in unsafe methods (POST, PATCH, DELETE)
    Uses refreshToken() to renew JWT tokens - with CSRF included in call

## Renderers

  index.html
    Contains the root element that enables JavaScript rendering

  index.js
    Creates the React DOM and wraps the app with providers and context

  App.js
    Initializes routing and renders Layout and Home.js as main elements

## 🧑‍🔬🔬 **Testing**

### Django Backend Tests
```bash
python manage.py test  # Run all Django tests
python manage.py test api.tests.test_hierarchical_permissions  # Specific test module
```

### React Frontend Tests
```bash
cd frontend
npm test  # Interactive test runner
npm test -- --watchAll=false  # Run once and exit
```

### Test Coverage
- **Authentication & Authorization:** JWT permissions, hierarchical access
- **API Endpoints:** CRUD operations for users, products, groups
- **Frontend Components:** User interactions, form submissions, navigation
- **Integration Tests:** Token refresh, CSRF protection, file uploads


