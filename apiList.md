DevMate Api

## authRouter
-post/login
-post/signup
-post/logout

## profileRouter
-get/profile/view
-patch/profile/edit
-patch/profile/password

## connectionRequestRouter
-post/request/send/interested/:userId
-post/request/send/ignored/:userId
-post/request/review/accepted/:requestId
-post/request/review/rejected/:requestId

## userRouter
-get/user/connections
-get/user/request/received
-get/feed -> get you the profile of other users

