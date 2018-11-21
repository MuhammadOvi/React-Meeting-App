
# Meeting App Using ReactJS
Here&apos;s a list of features included.

- Frontend: [**React**](https://reactjs.org)
- Routing: [**React Router**](https://www.npmjs.com/package/react-router)
- Backend: [**Firebase**](https://firebase.google.com)/[**Firestore**](https://firebase.google.com/docs/firestore)

------------

1. **Login**: Create a screen that will allow user to login with Facebook via Firebase.

2. **Profile Screen**: After login first time, the profile screen should appear. It consists of three screens.

	**a**. Enter your nickname and phone number provide a button next
  
	**b**. On clicking it, it will show user, 3 placeholders for uploading pictures, on clicking each, user can upload his/her picture! All must be required!, provide next button.
  
  	**c**. On next button, there should be a text “Select Beverages” with three boxes.
    
	1. Coffee
	2. Juice
	3. Cocktail *(with their respective images and another text)*
	
	And “duration of meeting” with options a) 20 min b) 60 min c) 120 min. User can select multiple options, like COFFEE, JUICE, 60 min and 120 min
3. **Map Screen**: On-clicking the next button, a map should appear with the user&apos;s current location. Also allow user to move the marker to set his/her location accurately! Provide a submit button! On submitting, all data should be stored in database inside the respective user’s data!

4. **Dashboard Screen**: On submitting, the dashboard screen should appear,
initially, it should show a text “You haven’t done any meeting yet!”, try creating a new meeting! And a button, “Set a meeting!”.

5. **Meeting Screen**: On clicking “Set a meeting!” button, a screen should appear and presents all the users that matches the beverages and duration of current user! E.g. Current User Selected COFFEE, JUICE, 60 min and 120 min, so, all the other users having atleast one match with current user’s beverages and atleast one match with the duration would appear in the list and he/she should be atleast under 5km from your location! E.g. A user having COFFEE & 60 min should match with the current user.

	The UI should be like:
The user info should be provided in a card and other cards should be in stack.
That’s mean these cards must be swipe-able
Check these packages:

	https://github.com/ssanjun/react-swing
  
	https://github.com/swapkats/react-swipe-deck

   ● Swiping left or pressing **X** button means, user don’t wanna meet. So the
next card (user) will be presented!

   ● Swiping right or pressing &#x2714; button means, user wanna meet this person,
So it should show the popup with the meeting person’s name and a text
*“Do you want to meet {Person name}?”*
6. **Meeting Point Selection Screen**: Using Foursquare Places API, show the nearest first three positions from your location selected!
And an input bar to search for more locations.

	For nearest, use this api: https://api.foursquare.com/v2/venues/explore
  
	For search, use this api: https://api.foursquare.com/v2/venues/search
  
   On clicking to any location, there should be two buttons available,
	1. **Next**: it should navigate to Date/Time Screen. 
	2. **Get Directions**: It should open the map, showing the direction routes from the user’s location to the selected location!
	
7. **Date/Time Selection Screen**: Show a calendar to user to select the date/time and a **SEND REQUEST** button. On clicking it, it should ask the user to Send the request? If yes, then this request data will be stored in database.

8. **Dashboard Screen**: Now after first request, your dashboard should show your meetings list with their statuses (PENDING / CANCELLED / ACCEPTED / COMPLICATED / DONE), list should be shown with these fields.
   - Avatar of the meeting requested user (2nd Person)
   - Name
   - Statuses
   - Date & Time
   - Location

9. **Request Popup**: After somebody requests a meeting with you, you should get a popup, with these fields.
   - Avatar of the both you and meeting requested user (2nd Person)
   - Name of the 2nd person
   - Meeting Duration
   - Location
   - Date and Time
   - Get Direction Button (Show map directions from your location to meeting location)
   - Confirm, Cancel Button

10. **Add Event to Calendar**: Use this package to add event to any calendar.

    https://jasonsalzman.github.io/react-add-to-calendar
    So in the case of google, he or she will be notified

11. **Apply Redux**: Upon login, the user’s info should be added in the Redux.

12. **Edit User Profile**: Add a button or something you like, for the profile page. Through it, he/she can edit all of his/her perspectives.

13. **Post Meeting Popup**: After the meeting date and time passed, both the users should be asked about “Was the meeting successful?”, and options would be “Yes” or “No”,
    - If both answered YES, the status of the meeting should be updated to DONE
    - If both answered NO, the status of the meeting should be updated to CANCELLED
    - If both answered differently, the status of the meeting should be updated to COMPLICATED
The status will appear on each&apos;s Dashboards

14. **Ratings**: After answering to above popup, he/she should be asked for the rating to the opposite user (Out of 5), and ratings should be stored in the user’s object in Firebase as an average of all previous ratings! The opposite person’s ratings will appear on your Dashboard and also when selecting a user for meeting!


------------

**Muhammad Ovi**
