# Client-side Encryption
One of the nicest concepts is how you can encrypt everything before it leaves your device. In this tutorial we are going to setup an environment and demonstrate how to achieve the goal.
# The goal
We want to have an encryption vault where we can upload a file. The file will be encrypted before leaving the client. Upon the upload, the interface will give the user a UUID and an encryption key by which they would be able to rerieve the original file. When a download is requested, the encrypted file will be downloaded and then would be encrypted on the user's device. This way, no sensitive information would be transferred and most of the workd will be done client-side.
