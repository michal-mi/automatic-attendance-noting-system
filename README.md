# Automated Attendance Noting System (for universities & schools)
<p align="center">
<img src="https://user-images.githubusercontent.com/65447595/205721236-ab8bbb52-d22a-4094-8adc-279c0d22c5b7.png " width="30%"/>
</p>

![GitHub](https://img.shields.io/github/license/michal-mi/automatic-attendance-noting-system)
![GitHub](https://img.shields.io/github/languages/count/michal-mi/automatic-attendance-noting-system) ![GitHub](https://img.shields.io/github/languages/top/michal-mi/automatic-attendance-noting-system) 
![GitHub](https://img.shields.io/badge/-JavaScript-white?logo=javaScript&logoColor=JUBILATION) ![GitHub](https://img.shields.io/badge/-ReactJs-61DAFB?logo=react&logoColor=white) ![GitHub](https://img.shields.io/badge/-ExpressJs-white?logo=express&logoColor=black) ![GitHub](https://img.shields.io/badge/-Node.Js-white?logo=node.JS&logoColor=PUTTINGGREEN) ![GitHub](https://img.shields.io/badge/-Java-white?logo=java&logoColor=PUTTINGGREEN) ![GitHub](https://img.shields.io/badge/-MySQL-white?logo=MYSQL&logoColor=LINOLEUMBLUE)
  

System for checking student attendance by scanning QR codes allowing also for managing institution of education. Contains of:
- server
- mobile app for Android (for students and lecturers),
- web app (for system's administrator, facility managers and lecturers)

# Installation
## 1. Database
Create database using sql files stored in folder **Database**. 
(You can create your database locally by creating, for example, a mysql docker container and importing data into it, or by using a dedicated MySQL Server application. You can also create a database using, for example, the Amazon AWS service or by using remotemysql.com.
Your database schema should look like this:
<img src="https://github.com/michal-mi/automatic-attendance-noting-system/blob/ProjektZespolowy/Database/ERD.png?raw=true" width="100%"/>
## 2. Server
 - Open project folder stored in **Server** directory using your favourite IDE (for example Visual Studio Code).
 - Go to config.js file.
 - Modify the config.js file by entering the database connection information (host address, user name, access password, database name).
 - Go to .env file.
 - There you need to provide information about the mailbox that will be used to send automatic information to users
    by email (emails with a link to change the password if the user forgets his password and emails with the initial password for newly created users). In .env you should provide email box service name, email and password to account.
>There may be problems with automatic sending of emails due to lack of proper settings. You should then change the settings of your email box.
 - If you wish you can also change private key used for encrypting passwords and signing tokens - JWTPRIVATEKEY
 - Check if port 8080 is free on your device. This is important because the server runs on this port. If port 8080 is busy release it.
 - Open build-in terminal.
 - Install needed dependencies using ```npm install``` command.
 - Run the server using ```npm start``` command.
## 3. Web app
 - Open project folder stored in **WebApp** directory using your favourite IDE (for example Visual Studio Code).
 - Open build-in terminal.
 - Install needed dependencies using ```npm install``` command.
 - Run the server using ```npm start``` command.
## 4. Mobile app
 - Open a project stored in **MobileApp** directory using android studio or other suitable ide.
 - Copy the IPv4 address of your device (on Windows simply open terminal and issue the ```ipconfig``` command).
 - Go to ```java/com.example.presenceqr/Config```
 - Replace serverAddress with the ipv4 address you have copied. For example: ```"http://192.168.43.56:8080/"```.
 - Select device in device manager.
 - Press "Run app" button.
# Key features
## For all users
 - logging into the system
 - logging out of the system
 - password recovery
 - changing password
 - changing/deleting profile picture
## For facility manager
 - create, view, edit and delete:
	 - groups
	 - classes
	 - subjects
	 - classrooms (including GPS coordinates)
	 - lecturers accounts
	 - students accounts
 - generate and print classroom's QR codes
 - create and edit facility calendar (including marking and unmarking days off for facility)
 - enter semester data
 - assign classroom, lecturer and group to classes
 - assign or remove students from group
 - assign / change assigment of roles for users students and lecturers
 - export and import students and lecturers (.csv, .json, .xml)
## For system administrator
 - add, view, edit and delete facility manager accounts
 - create, display, edit and archive facility
 - change/delete facility short and long logo
 - export and import facility managers (.csv, .json, .xml)
## For lecturer
 - display a list of students in specific classes along with their attendance
 - change the status of a student's attendance
 - display the student's total attendance for a subject
 - display your own schedule
 - view all yours classes
## For student
 - display the class schedule
 - get class attendance by scanning QR codes (with determination of the GPS position, time, etc.)
 - display your own attendances
 - display your own schedule
## For system
 - generating attendances
 - changing the status of a student's attendance (when student scan the QR code)
 - generate all days that are in the semester
# Tests
Unit tests have been prepared for the server (covering more than 99% of the lines of code). To run the tests:
1. Open server's terminal
2. Stop server
3. Run tests using ```npm test``` command.
4. See results in terminal
5. To see coverage test results open file:  ```/coverage/Icovreport/index.html```
>Tests may not be executed correctly if data in the database has been changed or semester has ended
# Credits


Michał Mielcarek:<a href="https://github.com/michal-mi">
<kbd>  <img src="https://avatars.githubusercontent.com/u/65447595?v=4" height="auto" width="60"/></kbd>
</a>

Maciej Nawrot:<a href="https://github.com/MaciekNawrot">
<kbd>  <img src="https://avatars.githubusercontent.com/u/101277247?v=4" height="auto" width="60"/></kbd>
</a>

Michał Migryt:<a href="https://github.com/michal-migryt">
<kbd>  <img src="https://avatars.githubusercontent.com/u/65659701?v=4" height="auto" width="60"/></kbd>
</a>



|                |Michał Mielcarek           |Maciej Nawrot            |Michał Migryt
|----------------|---------------------------|-------------------------|-----------------------------
|Web app|X       |X      					 |						   |
|Mobile app      |        					 |            			   |X
|Server      	 |X							 |X						   |
# Contact
Michał Mielcarek - michal.mielcarek.00@gmail.com / michal.mielcarek@pollub.edu.pl
