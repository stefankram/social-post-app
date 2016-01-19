# social-post-app
Social Post App is a web based application that allows users to post, follow, edit, and delete statuses they make to Facebook, Twitter, and LinkedIn. The application works by submitting a status on the user's behalf to each social network and storing the status ID in a MongoDB table. The application then keeps track of the status by retrieving comments from its respective social network and includes other options such as editing and deleting statuses. Technologies used include [PassportJS](http://passportjs.org/) for authentication for each social network as well as [Semantic-UI](http://semantic-ui.com/) for the styling.

### Images of the Web UI
Login screen which uses Google for authentication
![Login screen](https://raw.githubusercontent.com/stefankram/social-post-app/master/images/img1.png "Login screen")

Main interface displaying login buttons for each social network
![Main interface](https://raw.githubusercontent.com/stefankram/social-post-app/master/images/img2.png "Main interface")

Main interface logged in, textfield and checkboxes filled in
![Logged in](https://raw.githubusercontent.com/stefankram/social-post-app/master/images/img3.png "Logged in")

Display submitted status and old statuses were deleted
![Submit status](https://raw.githubusercontent.com/stefankram/social-post-app/master/images/img4.png "Submit status")
