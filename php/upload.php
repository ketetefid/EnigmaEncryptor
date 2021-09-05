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
     realname TEXT NOT NULL,
     mime     TEXT NOT NULL,
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

    $uploadsuccess = true;
    $blobuid = bin2hex(random_bytes(18));
    $blobpath = './uploads/'.bin2hex(random_bytes(20)); // to force usage of the form
    if (move_uploaded_file($_FILES["encfile"]["tmp_name"], $blobpath) !== TRUE) {
	echo "The blob was NOT uploaded successfully.";
	$uploadsuccess = false;
    }
    
    //$blobmeta = stat($blobpath);
    $blobsize = $_POST["filesize"];
    $blobrealname = $_POST["realname"];
    $blobtype = $_POST["filetype"];

    $sql = "INSERT INTO $mytable (id,uuid,filename,size,realname,mime) VALUES (0,'$blobuid','$blobpath','$blobsize','$blobrealname','$blobtype')";
    
    if ($conn->query($sql) !== TRUE) {
	echo "\nError inserting entries. " . $conn->error;
    }

    // Send the UUID back
    if ($uploadsuccess) {
	echo $blobuid;
    }

}



if (isset($_POST['myuuid'])) {

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

    // Bad practice because of injection
    //$sql = "SELECT filename FROM $mytable WHERE uuid = '".$fuuid."'";
    //$rs = $conn->query($sql);


    $sql = "SELECT filename,size,realname,mime FROM $mytable WHERE uuid = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('s',$fuuid);
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
	$thefilename=$row['filename'];
	$thefilesize=$row['size'];
	$thefilemime=$row['mime'];
	$thefilerealname=$row['realname'];
    }

    $thefileprops=[$thefilename, $thefilesize, $thefilemime, $thefilerealname];
    echo json_encode($thefileprops);

}

// closing connection
$conn->close();


?>
