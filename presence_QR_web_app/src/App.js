import { Route, Routes, Navigate } from "react-router-dom"
import Login from "./components/Login"
import SendEmail from "./components/RecoverPassword/SendEmail"
import NewPassword from "./components/RecoverPassword/NewPassword"
import Main from "./components/Main"
import MyAccount from "./components/MyAccount"
import Settings from "./components/Settings"
import PresenceListGroupSubject from "./components/Presence/PresenceListGroupSubject"
import ListOfStudentsForSubjectGroup from "./components/Presence/ListOfStudentsForSubjectGroup"
import ListOfClassesForForSubjectGroup from "./components/Presence/ListOfClassesForSubjectGroup"
import ListOfClassAttendance from "./components/Presence/ListOfClassAttendance"
import LessonsSchedule from "./components/Lesson/LessonsSchedule"
import LessonInfo from "./components/Lesson/LessonInfo"
import ManageUsersMenu from "./components/User/ManageUsersMenu"
import AddUser from "./components/User/AddUser"
import ImportUsers from "./components/User/ImportUsers"
import DisplayListOfUsers from "./components/User/DisplayListOfUsers"
import EditUser from "./components/User/EditUser"
import ExportUsers from "./components/User/ExportUsers"
import ManageClassroomsMenu from "./components/Classroom/ManageClassroomsMenu"
import AddClassroom from "./components/Classroom/AddClassroom"
import DisplayListOfClassrooms from "./components/Classroom/DisplayListOfClassrooms"
import EditClassroom from "./components/Classroom/EditClassroom"
import ManageGroupsMenu from "./components/Group/ManageGroupsMenu"
import AddGroup from "./components/Group/AddGroup"
import DisplayListOfGroups from "./components/Group/DisplayListOfGroups"
import EditGroup from "./components/Group/EditGroup"
import AssignStudents from "./components/Group/AssignStudents"
import ManageSubjectsMenu from "./components/Subject/ManageSubjectsMenu"
import AddSubject from "./components/Subject/AddSubject"
import EditSubject from "./components/Subject/EditSubject"
import DisplayListOfSubjects from "./components/Subject/DisplayListOfSubjects"
import ManageCalendarMenu from "./components/Calendar/ManageCalendarMenu"
import AddDaysToCalendar from "./components/Calendar/AddDaysToCalendar"
import EditCalendar from "./components/Calendar/EditCalendar"
import ManageClassesMenu from "./components/Classes/ManageClassesMenu"
import AddClasses from "./components/Classes/AddClasses"
import DisplayListOfClasses from "./components/Classes/DisplayListOfClasses"
import EditClasses from "./components/Classes/EditClasses"
import ManageFacilitiesMenu from "./components/Facility/ManageFacilitiesMenu"
import AddFacility from "./components/Facility/AddFacility"
import DisplayListOfFacilities from "./components/Facility/DisplayListOfFacilities"
import EditFacility from "./components/Facility/EditFacility"


function App() {
  var role = 0
  const user = sessionStorage.getItem("token")
  if (user !== null) {
    var decodedJWT = parseJwt(sessionStorage.getItem("token"))
    role = decodedJWT.user_role
    if (role === 4) {
      sessionStorage.removeItem("token")
    }
  }

  return (
    <Routes>
      {/* login page: (EVERY user) */}
      <Route path="/login" exact element={<Login />} />

      {/* send email with link to change password: (EVERY user) */}
      <Route path="/recoverPassword" exact element={<SendEmail />} />

      {/* create new password: (EVERY user) */}
      <Route path="/recoverPassword/:id" exact element={<NewPassword />} />

      {/* main page: (ONLY admin, facility_manager and lecturer) */}
      {user && (role === 1 || role === 2 || role === 3) && <Route path="/" exact element={<Main />} />}
      <Route path="/" element={<Navigate replace to="/login" />} />


      {/*MY ACCOUNT*/}
      {/* my account: (ONLY admin, facility_manager and lecturer) */}
      {user && (role === 1 || role === 2 || role === 3) && <Route path="/myAccount" exact element={<MyAccount />} />}
      <Route path="/myAccount" element={<Navigate replace to="/" />} />


      {/*SETTINGS*/}
      {/* settings: (ONLY admin, facility_manager and lecturer) */}
      {user && (role === 1 || role === 2 || role === 3) && <Route path="/settings" exact element={<Settings />} />}
      <Route path="/settings" element={<Navigate replace to="/" />} />


      {/*PRESENCE*/}
      {/* show group-subject list - presence module: (ONLY lecturer) */}
      {user && role === 3 && <Route path="/presenceListGroupSubject" exact element={<PresenceListGroupSubject />} />}
      <Route path="/presenceListGroupSubject" element={<Navigate replace to="/" />} />

      {/* show list of students with attendance from chosen group-subject - presence module: (ONLY lecturer) */}
      {user && role === 3 && <Route path="/listOfStudentsForSubjectGroup/:id" exact element={<ListOfStudentsForSubjectGroup />} />}
      <Route path="/listOfStudentsForSubjectGroup/:id" element={<Navigate replace to="/" />} />

      {/* show list of classes from chosen group-subject - presence module: (ONLY lecturer) */}
      {user && role === 3 && <Route path="/listOfClassesForSubjectGroup/:id" exact element={<ListOfClassesForForSubjectGroup />} />}
      <Route path="/listOfClassesForSubjectGroup/:id" element={<Navigate replace to="/" />} />

      {/* show attendance list for the chosen lesson  - presence module: (ONLY lecturer) */}
      {user && role === 3 && <Route path="/listOfClassAttendance/:id" exact element={<ListOfClassAttendance />} />}
      <Route path="/listOfClassAttendance/:id" element={<Navigate replace to="/" />} />


      {/*SCHEDULE*/}
      {/* show lesson schedule: (ONLY lecturer) */}
      {user && role === 3 && <Route path="/lessonSchedule" exact element={<LessonsSchedule />} />}
      <Route path="/lessonSchedule" element={<Navigate replace to="/" />} />

      {/* shows lesson info: (ONLY lecturer) */}
      {user && role === 3 && <Route path="/lessonInfo/:id" exact element={<LessonInfo />} />}
      <Route path="/lessonInfo/:id" element={<Navigate replace to="/" />} />


      {/*USER*/}
      {/* manage users menu: (ONLY admin and facility_manager) */}
      {user && (role === 1 || role === 2) && <Route path="/manageUsersMenu" exact element={<ManageUsersMenu />} />}
      <Route path="/manageUsersMenu" element={<Navigate replace to="/" />} />

      {/* add user: (ONLY admin and facility_manager) */}
      {user && (role === 1 || role === 2) && <Route path="/addUser" exact element={<AddUser />} />}
      <Route path="/addUser" element={<Navigate replace to="/" />} />

      {/* import users: (ONLY admin and facility_manager) */}
      {user && (role === 1 || role === 2) && <Route path="/importUsers" exact element={<ImportUsers />} />}
      <Route path="/importUsers" element={<Navigate replace to="/" />} />

      {/* display list of users: (ONLY admin and facility_manager) */}
      {user && (role === 1 || role === 2) && <Route path="/displayListOfUsers" exact element={<DisplayListOfUsers />} />}
      <Route path="/displayListOfUsers" element={<Navigate replace to="/" />} />

      {/* edit selected user: (ONLY admin and facility_manager) */}
      {user && (role === 1 || role === 2) && <Route path="/editUser/:id" exact element={<EditUser />} />}
      <Route path="/editUser/:id" element={<Navigate replace to="/" />} />

      {/* export users: (ONLY admin and facility_manager) */}
      {user && (role === 1 || role === 2) && <Route path="/exportUsers/:idArray" exact element={<ExportUsers />} />}
      <Route path="/exportUsers/:idArray" element={<Navigate replace to="/" />} />


      {/*CLASSROOM*/}
      {/* manage classrooms menu: (ONLY facility_manager) */}
      {user && (role === 2) && <Route path="/manageClassroomsMenu" exact element={<ManageClassroomsMenu />} />}
      <Route path="/manageClassroomsMenu" element={<Navigate replace to="/" />} />

      {/* add classroom: (ONLY facility_manager) */}
      {user && (role === 2) && <Route path="/addClassroom" exact element={<AddClassroom />} />}
      <Route path="/addClassroom" element={<Navigate replace to="/" />} />

      {/* display list of classrooms: (ONLY facility_manager) */}
      {user && (role === 2) && <Route path="/displayListOfClassrooms" exact element={<DisplayListOfClassrooms />} />}
      <Route path="/displayListOfClassrooms" element={<Navigate replace to="/" />} />

      {/* edit classroom: (ONLY facility_manager) */}
      {user && (role === 2) && <Route path="/editClassroom/:id" exact element={<EditClassroom />} />}
      <Route path="/editClassroom/:id" element={<Navigate replace to="/" />} />


      {/*GROUP*/}
      {/* manage groups menu: (ONLY facility_manager) */}
      {user && (role === 2) && <Route path="/manageGroupsMenu" exact element={<ManageGroupsMenu />} />}
      <Route path="/ManageGroupsMenu" element={<Navigate replace to="/" />} />

      {/* add group: (ONLY facility_manager) */}
      {user && (role === 2) && <Route path="/addGroup" exact element={<AddGroup />} />}
      <Route path="/addGroup" element={<Navigate replace to="/" />} />

      {/* display list of groups: (ONLY facility_manager) */}
      {user && (role === 2) && <Route path="/displayListOfGroups" exact element={<DisplayListOfGroups />} />}
      <Route path="/displayListOfGroups" element={<Navigate replace to="/" />} />

      {/* edit group: (ONLY facility_manager) */}
      {user && (role === 2) && <Route path="/editGroup/:id" exact element={<EditGroup />} />}
      <Route path="/editGroup/:id" element={<Navigate replace to="/" />} />

      {/* assign students to group: (ONLY facility_manager) */}
      {user && (role === 2) && <Route path="/assignStudents/:id" exact element={<AssignStudents />} />}
      <Route path="/assignStudents/:id" element={<Navigate replace to="/" />} />

      {/*SUBJECT*/}
      {/* manage subjects menu: (ONLY facility_manager) */}
      {user && (role === 2) && <Route path="/manageSubjectsMenu" exact element={<ManageSubjectsMenu />} />}
      <Route path="/manageSubjectsMenu" element={<Navigate replace to="/" />} />

      {/* add subject: (ONLY facility_manager) */}
      {user && (role === 2) && <Route path="/addSubject" exact element={<AddSubject />} />}
      <Route path="/addSubject" element={<Navigate replace to="/" />} />

      {/* display list of subjects: (ONLY facility_manager) */}
      {user && (role === 2) && <Route path="/displayListOfSubjects" exact element={<DisplayListOfSubjects />} />}
      <Route path="/displayListOfSubjects" element={<Navigate replace to="/" />} />

      {/* edit subject: (ONLY facility_manager) */}
      {user && (role === 2) && <Route path="/editSubject/:id" exact element={<EditSubject />} />}
      <Route path="/editSubject/:id" element={<Navigate replace to="/" />} />


      {/*CALENDAR*/}
      {/* manage calendar menu: (ONLY facility_manager) */}
      {user && (role === 2) && <Route path="/manageCalendarMenu" exact element={<ManageCalendarMenu />} />}
      <Route path="/manageCalendarMenu" element={<Navigate replace to="/" />} />

      {/* add days to calendar: (ONLY facility_manager) */}
      {user && (role === 2) && <Route path="/addDaysToCalendar" exact element={<AddDaysToCalendar />} />}
      <Route path="/addDaysToCalendar" element={<Navigate replace to="/" />} />

      {/* edit existing days in calendar: (ONLY facility_manager) */}
      {user && (role === 2) && <Route path="/editCalendar" exact element={<EditCalendar />} />}
      <Route path="/editCalendar" element={<Navigate replace to="/" />} />


      {/*CLASSES*/}
      {/* manage classes menu: (ONLY facility_manager) */}
      {user && (role === 2) && <Route path="/manageClassesMenu" exact element={<ManageClassesMenu />} />}
      <Route path="/manageClassesMenu" element={<Navigate replace to="/" />} />

      {/* add classes: (ONLY facility_manager) */}
      {user && (role === 2) && <Route path="/addClasses" exact element={<AddClasses />} />}
      <Route path="/addClasses" element={<Navigate replace to="/" />} />

      {/* display list of classes: (ONLY facility_manager) */}
      {user && (role === 2) && <Route path="/displayListOfClasses" exact element={<DisplayListOfClasses />} />}
      <Route path="/displayListOfClasses" element={<Navigate replace to="/" />} />

      {/* edit classes: (ONLY facility_manager) */}
      {user && (role === 2) && <Route path="/editClasses/:id" exact element={<EditClasses />} />}
      <Route path="/editClasses/:id" element={<Navigate replace to="/" />} />



      {/*FACILITIES*/}
      {/* manage facilities menu: (ONLY admin) */}
      {user && (role === 1) && <Route path="/manageFacilitiesMenu" exact element={<ManageFacilitiesMenu />} />}
      <Route path="/manageFacilitiesMenu" element={<Navigate replace to="/" />} />

      {/* add facility: (ONLY admin) */}
      {user && (role === 1) && <Route path="/addFacility" exact element={<AddFacility />} />}
      <Route path="/addFacility" element={<Navigate replace to="/" />} />

      {/* display list of facilities: (ONLY admin) */}
      {user && (role === 1) && <Route path="/displayListOfFacilities" exact element={<DisplayListOfFacilities />} />}
      <Route path="/displayListOfFacilities" element={<Navigate replace to="/" />} />

      {/* edit facility: (ONLY admin) */}
      {user && (role === 1) && <Route path="/editFacility/:id" exact element={<EditFacility />} />}
      <Route path="/editFacility/:id" element={<Navigate replace to="/" />} />
    </Routes>
  )
}
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};
export default App