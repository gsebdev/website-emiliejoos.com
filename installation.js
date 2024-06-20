const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const readLine = require("readline");
const pagesConfig = require("./src/app/_config/pages.config.json");

const queries = [
  `CREATE TABLE IF NOT EXISTS users (
        id INT NOT NULL AUTO_INCREMENT,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        lastname VARCHAR(255) NOT NULL,
        firstname VARCHAR(255) NOT NULL,
        PRIMARY KEY (id)
    )`,
  `CREATE TABLE IF NOT EXISTS settings (
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        value JSON NOT NULL,
        PRIMARY KEY (id)
    )`,
  `CREATE TABLE IF NOT EXISTS logs (
        id INT NOT NULL AUTO_INCREMENT,
        username VARCHAR(255) NOT NULL,
        action VARCHAR(255) NOT NULL,
        error TEXT,
        timestamp timestamp DEFAULT CURRENT_TIMESTAMP,
        payload JSON,
        PRIMARY KEY (id)
    )`,
  `CREATE TABLE IF NOT EXISTS images (
        id INT NOT NULL AUTO_INCREMENT,
        filename VARCHAR(255) NOT NULL,
        height INT NOT NULL,
        width INT NOT NULL,
        alt TEXT,
        src VARCHAR(255) NOT NULL,
        blur_data_image TEXT,
        PRIMARY KEY (id)
    )`,
  `CREATE TABLE IF NOT EXISTS partners (
        id INT NOT NULL AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        url VARCHAR(255) NOT NULL,
        logo JSON,
        description TEXT,
        display_order INT NOT NULL,
        PRIMARY KEY (id)
    )`,
  `CREATE TABLE IF NOT EXISTS pages (
        id INT NOT NULL AUTO_INCREMENT,
        slug VARCHAR(255) NOT NULL,
        images JSON,
        content MEDIUMTEXT,
        title VARCHAR(255) NOT NULL,
        images_number INT NOT NULL,
        PRIMARY KEY (id)
    )`,
];

const InstallTables = async () => {

  console.log("Installing...");

  const db = await mysql.createConnection({
    host: process.env.DB_HOST.replaceAll('\'', ''),
    port: Number(process.env.DB_PORT.replaceAll('\'', '')),
    user: process.env.DB_USER.replaceAll('\'', ''),
    password: process.env.DB_PASSWORD.replaceAll('\'', ''),
    database: process.env.DB_NAME.replaceAll('\'', ''),
  });

  try {
    for (const query of queries) {
      await db.query(query);
    }

    for (const page of Object.entries(pagesConfig)) {
      const [slug, { title, images_number }] = page;

      const [pageExists] = await db.query(
        `SELECT * FROM pages WHERE slug = ?`,
        [slug]
      );

      if (pageExists.length > 0) {
        continue;
      }

      const [result] = await db.query(
        `INSERT INTO pages (slug, title, images_number, content, images) VALUES (?, ?, ?, ?, ?)`,
        [slug, title, images_number, "", "[]"]
      );

      if (result.affectedRows === 0) {
        throw new Error("Failed to insert page");
      }
    }

    // check if a user is present in the database
    const [user] = await db.query("SELECT * FROM users");

    if (!user.length) {
      // prompt user to add a new user
      const readline = readLine.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      readline.question(
        "Enter a username for the admin account: ",
        async (username) => {
          readline.question(
            "Enter a password for the admin account: ",
            async (password) => {
              readline.question(
                "Enter an email for the admin account: ",
                async (email) => {
                  readline.question(
                    "Enter your lastname: ",
                    async (lastname) => {
                      readline.question(
                        "Enter your firstname: ",
                        async (firstname) => {
                          readline.close();
                          // insert the new user into the database
                          const encodedPassword = await bcrypt.hash(
                            password,
                            10
                          );
                          const [result] = await db.query(
                            "INSERT INTO users (username, password, email, lastname, firstname) VALUES (?, ?, ?, ?, ?)",
                            [
                              username,
                              encodedPassword,
                              email,
                              lastname,
                              firstname,
                            ]
                          );
                          if (result.affectedRows === 0) {
                            throw new Error("Failed to insert user");
                          }
                          console.log("User added successfully");
                          db.end();
                          process.exit(0);
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    } else {
      console.log("User already exists");
      db.end();
      process.exit(0);
    }
  } catch (error) {
    db.end();
    console.error(error);
    console.error("Failed to install app");

  } 
};

InstallTables();
