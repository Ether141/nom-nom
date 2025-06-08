<img src="frontend/images/logo.png" alt="Nom-nom Logo" width="500"/>

# 🍽️ Nom-nom App – Online Food Ordering with Delivery

The **Nom-nom App** allows users to order food online from selected restaurants and have it delivered to a specified address. Restaurants are filtered based on the delivery address provided by the user.

The primary goal of the project is simplicity, relying on basic technologies without additional frameworks or preprocessors. The frontend is built purely with **HTML, CSS, and vanilla JavaScript**, while the backend is powered by a lightweight, custom-made framework called **blink-http**, developed in **C# with .NET 9**.

---

## 🌟 Key Features:

* **Restaurant search:** Find restaurants within a specified area around your delivery address.
* **Filtering options:** Easily filter restaurants by name, tags, or cuisine.
* **User accounts:** Create and manage user profiles.
* **Multiple delivery addresses:** Store and manage multiple delivery addresses.
* **Order tracking:** Real-time tracking of your orders.
* **Multiple concurrent orders:** Place and manage several orders at once.
* **Saved carts:** Keep separate carts saved per restaurant and user.


---

## 📦 Modules:

* **Frontend:** Web application built with pure JavaScript, HTML, and CSS.
* **Backend:** REST API created with .NET 9 and blink-http framework.
* **Database:** PostgreSQL database.

---

## 🚀 Requirements:

To run the application, Docker and Docker Compose are sufficient. However, manual deployment is possible. For manual deployment, you will need:

* `.NET 9`
* `PostgreSQL`
* A simple HTTP server to serve the frontend files.

---

## 🐳 Docker Setup:

The simplest way to get started is by using the provided `docker-compose.yml` file. It creates four containers:

* **Frontend:** Served by an Nginx web server.
* **Backend:** Runs on a .NET 9 environment providing API services.
* **PostgresDB:** PostgreSQL database container for data persistence.
* **PgAdmin:** Web-based graphical interface for managing the PostgreSQL database.

During the Docker setup, a database named `nomnom` is automatically created, and example data is imported. After starting Docker Compose, the app will be immediately ready for testing.

Database dumps and sample files are available in the `docker` directory.

In order to start application, just run this command inside `docker` directory:
```sh
docker compose up --build
```

---

## 🌐 Access Information:

### Frontend:

* URL: [http://localhost:8080](http://localhost:8080)

### Backend:

* URL: [http://localhost:5000](http://localhost:5000)
* Supports CORS for `localhost:8080`

### PostgreSQL Database:

* Accessible only within Docker network
* **Username:** `postgres`
* **Password:** `password`

### PgAdmin:

* URL: [http://localhost:8081](http://localhost:8081)
* **Email:** `admin@example.com`
* **Password:** `admin`

---

## ⚙️ API Server Configuration

Configure the API server using the configuration file located at `backend/config.cfg`.

```ini
[server]
prefixes = http://*:5000/                                   # URL where the server listens
route_prefix = api                                          # Routing prefix
content_path = /app/data                                    # Path to content directory (e.g., restaurant banners)

[sql]
hostname = db                                               # Database server address
username = postgres                                         # Database username
password = password                                         # Database user password
database = nomnom                                           # Database name
logging_on = false                                          # Enable or disable SQL query logging

[nomnom]
maximal_distance = 20                                       # Maximum distance in kilometers for restaurant search

[cors]
origin = http://localhost:8080                              # Allowed CORS origins
headers = content-type, content-length                      # Allowed CORS headers
credentials = true                                          # Allow CORS credentials
methods = POST, GET, DELETE, PUT                            # Allowed CORS methods
```

