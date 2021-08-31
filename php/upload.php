<?php

// The MySQL service named in the docker-compose.yml.
$host = 'db';

// Database use name
$user = 'MYSQL_USER';

//database user password
$pass = 'MYSQL_PASSWORD';

// database name
$mydatabase = 'MYSQL_DATABASE';
// check the mysql connection status

$conn = new mysqli($host, $user, $pass, $mydatabase);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}


$mytable="enc_filesDB";

// For resetting the table if you want
/*
   $sql = "DROP TABLE IF EXISTS $mytable";

   if ($conn->query($sql) !== TRUE) {
   echo "\nError deleting table: " . $conn->error;
   }
 */


// Creating the table
$sql = "
CREATE TABLE IF NOT EXISTS $mytable
  (
     id       INT NOT NULL auto_increment,
     uuid     TEXT NOT NULL,
     filename TEXT NOT NULL,
     size     TEXT NOT NULL,
     PRIMARY KEY (id)
  )  
";


if ($conn->query($sql) !== TRUE) {
    echo "\nError creating the table: " . $conn->error;
}



if (isset($_POST['encfile'])) {

    $blob = $_POST['encfile'];
    $blobuid = bin2hex(random_bytes(16));
    $blobpath = './uploads/'.bin2hex(random_bytes(20)); // to force usage of the form
    file_put_contents ($blobpath,$blob);
    $blobmeta = stat($blobpath);
    $blobsize = $blobmeta['size'];

    $sql = "INSERT INTO $mytable (id,uuid,filename,size) VALUES (0,'$blobuid','$blobpath','$blobsize')";
    
    if ($conn->query($sql) !== TRUE) {
	echo "\nError inserting entries. " . $conn->error;
    }

    // Send the UUID back
    echo $blobuid;

}


//print_r($_FILES);
if (isset($_FILES["encfile"])) {


    $blobuid = bin2hex(random_bytes(16));
    $blobpath = './uploads/'.bin2hex(random_bytes(20)); // to force usage of the form
    if (move_uploaded_file($_FILES["encfile"]["tmp_name"], $blobpath) !== TRUE) {
	echo "The blob was NOT uploaded successfully.";
    }
    
    $blobmeta = stat($blobpath);
    $blobsize = $_FILES["encfile"]["size"];

    $sql = "INSERT INTO $mytable (id,uuid,filename,size) VALUES (0,'$blobuid','$blobpath','$blobsize')";
    
    if ($conn->query($sql) !== TRUE) {
	echo "\nError inserting entries. " . $conn->error;
    }

    // Send the UUID back
    echo $blobuid;

}



if (isset($_POST['mykey']) and isset($_POST['myuuid'])) {

/*
    // Show the table
    $sql = "SELECT * FROM $mytable";
    echo $sql;
    $rs = $conn->query($sql);

    while($row = mysqli_fetch_array($rs))
    { 
	print "<tr>"; 
	print "<td>" . $row['id'] . "</td>"; 
	print "<td>" . $row['uuid'] . "</td>"; 
	print "<td>" . $row['filename'] . "</td>"; 
	print "<td>" . $row['size'] . "</td>";
	print "</tr>"; 
    } 
*/
    
    $fuuid = $_POST['myuuid'];
    $deckey = $_POST['mykey'];

    // Bad practice because of injection
    //$sql = "SELECT filename FROM $mytable WHERE uuid = '".$fuuid."'";
    //$rs = $conn->query($sql);


    $sql = "SELECT filename FROM $mytable WHERE uuid = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('s',$fuuid);
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
	$thefilename=$row['filename'];
    }
    
    echo $thefilename;

}

// closing connection
$conn->close();


?>
