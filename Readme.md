# Shop

Lightweight shop application with a Django REST backend and a React frontend. 
The main goal is to showcase API, and Django backend server that is connected to React frontend server
The focus is to make a template web app that is skalable and can be filled with desired components

## Explanation of workflow
Client gets rendered page on frontend server and sees
  ### Layout.js
    consists of
      navbar:
        renders hyperlinks to components on top of the screen
          Login.js --> form with username and password
          Logout.js --> resets all data and clears tokenStore
          Products.js --> shows groups of products that navigate to products of that group
          Shop.js --> returns to homepage that shows groups of products
          Administration.js --> panel only users in JWT group and supersuer group can see
      outlet:
        renders components in the midle of the screen 
  ### Login.js
    sets placeholders for:
      username --> backend | /api/auth/login/ --> LoginView <-- LoginSerializer
      password --> backend | /api/auth/login/ --> LoginView <-- LoginSerializer
        
    if user is superuser or in jwt group:
      --> backend will fetch access and refresh token

    can be logged in as:
      login --> user with JWT
      loginSession --. user without JWT

    user information goes to AuthContext.js and tokenStore.js
  ### Logininfo.jsx
    renders placeholders for user info and fetches info of logged in user from AuthContext.jsx
      user --> AuthContext.jsx | backend /api/auth/me/ | login --> refreshUser or loginSession
      loading --> AuthContext.jsx --> boolean function loading while awaiting response
      role  --> AuthContext.jsx | backend /api/auth/me/ | login --> refreshUser or loginSessi | shows user
      jwt --> AuthContext.jsx | backend /api/auth/me/ | login --> refreshUser or loginSessi | shows token
  ### inside Logininfo.jsx --> button for Logout
    resets all data and clears tokenStore
  ### Products.js
    renders:
      groups by id: --> backend | shop.router->groups included in api/ --> ProductGroupViewSet <-- ProductGroupSerializer
            ⬇️     
        on click
            ⬇️
      products of that group --> backend | router->products included in api --> ProductViewSet <--    ProductSerializer
  ### Shop  same as Products but this one is button
    renders:
      groups by id: --> backend | shop.router->groups included in api/ --> ProductGroupViewSet <-- ProductGroupSerializer
          ⬇️
      on click
          ⬇️
      products of that group navigates to Products.js product of the selected group
  ### Administration.js
    renders components for specific users
    for:
      superuser:
        KorisniciCRUD --> on click:
          renders input for:
            user --> backend | shop.router->users included in api/ --> KorisnikViewSet <-- UserSerializer
            email --> backend | shop.router->users included in api/ --> KorisnikViewSet <-- UserSerializer
            password --> backend | shop.router->users included in api/ --> KorisnikViewSet <-- UserSerializer
            addUser button--> backend | shop.router->users included in api/ --> KorisnikViewSet <-- UserSerializer + addUser for POST method
        ProizvodiCRUD
          renders input for:
            * all products and their prices --> backend | products of that group --> backend | router->products included in api --> ProductViewSet <-- ProductSerializer
            * Edit price button --> editId --> ProductViewSet + newPrice --> + setProducts
            * Save button (edit price)--> backend | products of that group --> backend | router->products included in api --> ProductViewSet <-- ProductSerializer [cena] + "PATCH" method
            * Delete button -->  backend shop.router->products included in api/ --> ProductViewSet <-- ProductSerializer + deleteProduct for DELETE method
            * Add product menu 
              renders form for info on product + picture
              puts them in setNewItem and setImage
              on click addProduct --> backend shop.router->products included in api/ --> ProductViewSet <-- ProductSerializer + addProduct for POST method

      JWT bearer:
        ProizvodiCRUD

## Utilites

  ### AuthContext
    sets up data of the curent client, and functions for changing the state
    data:
      user
      token
      loading
    functions:
      refreshUser
      login
      loginSession
      logout
  ### tokenStore.js
    sets up tokenStore for stroing tokens
  ### ProtectedRoutes.js
    checks user data and automaticly rout to home page if data doesent mach
  ### Api.js
    sets crsf token in getCookie
    when calling refreshToken for refreshing JWT token it will include csrf token
    adds crsf token in all unsafe methods
## Renderers

  ### index.html
    calls "root" which enables Java Script
  ### index.js
    creates DOME with all wrappers used
  ### App.js
    calls components in layout and Home.js element

    