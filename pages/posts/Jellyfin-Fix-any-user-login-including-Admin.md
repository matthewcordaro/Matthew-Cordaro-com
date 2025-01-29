---
title: "Jellyfin: Fix any User login, including Admin"
date: 2025/1/29
description: How to get users back to their entertainment
tag: Jellyfin
author: Matthew Cordaro
---

Try these in order as they get increasingly technical...

---

## General Users (Non-Admin)
### Simple forgotten password
From the login screen you can reset your password.

_Note: This requires email to be setup on the server to automate this for the user._

### Assisted password reset
1) Login as a Jellyfin server admin user.
2) Select Menu > Administration > Dashboard.
3) On the Admin Dashboard, select Users.
4) Select the User to fix.
5) At the top, select password.
6) Ignoring current password, set a new password for the User.
7) Pass it along to the User and inform them it's best practice to update it after they log in. 

### Locked account
If the user still cant login they are likely locked out from too many failure attempts
1) Login as a Jellyfin server admin user.
2) Select Menu > Administration > Dashboard.
3) On the Admin Dashboard, select Users.
4) Select the User to fix.
5) Scroll to bottom.
6) Increase the User's failure attempts by one.
7) Have the User attempt login again.
8) Repeat 6 & 7 as necessary.
9) (Optional, best practice) Decrease the User's failure attempts to the original amount.

---

## Admin User
### Password reset
For this you will need read access to the server.
1) Open up your `server` folder where Jellyfin is located. For Windows this is something like `%PROGRAMDATA%\Jellyfin\Server` , Linux is probably `/opt/jellyfin/`.
2) Go to the site root and click forgot password, enter your Jellyfin admin name and click Submit.
3) Jellyfin will give you a path to a file that has just been created on your server. Open it in a text editor.
4) This JSON file has a pin in it at the beginning. should look like `FF-00-99-AA`. Copy it as you will need it a few times.
5) Go back to your browser and click the "Got It" button and a pin entry section should appear.
6) Paste the pin in and submit.  You will get a confirmation the password was reset and is now the pin you just entered. The JSON file that contained it will automatically be deleted.
7) Go login with the admin account an update the password to something other than the generated pin.  If you get a login error, you may have failed login too many times continue with below fix.

### Locked account
For this procedure you will need administrative access to update Jellyfin's SQLite database.  **Try other steps first!**
1) Download and install an SQLite editor. It's easy, Google is your friend. I'll wait here...
2) Open up your server's `data` folder where Jellyfin is located. _Note: For Windows this is something like `%PROGRAMDATA%\Jellyfin\Server\data` Linux is probably `/var/lib/jellyfin/data/`._
3) As a privileged user (administrator) open jellyfin.db with your SQLite software. _Note: make sure you know how to update the DB, this includes executing the statement AND writing out the changes._
4) Execute the following SQL statement while making sure to change `admin` to your admin user on both lines.

    ```sql
    -- Reset the login attempts & enable the user 
    UPDATE Users SET InvalidLoginAttemptCount = 0 WHERE Username = 'admin';
    UPDATE Permissions SET Value = 0 WHERE Kind = 2 AND UserId IN (SELECT Id FROM Users WHERE Username = 'admin');
    ```
    See [Jellyfin Permission Kinds](https://github.com/jellyfin/jellyfin/blob/master/Jellyfin.Data/Enums/PermissionKind.cs)
   
5) Shutdown Jellyfin
6) Write out the SQL Changes, close the database.
7) Restart Jellyfin and try resetting the admin password again as above with the JSON file.

---

If all went well, you and your Users should be back to enjoying content on your Jellyfin server now!

Feel free to contact me if there are any update to this procure.