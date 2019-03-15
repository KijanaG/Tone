const sendUser = async (id) => {
    console.log("INSIDE SERVICES")
    let user = {
        user: id
    }
    await fetch("http://127.0.0.1:5000/user", {
        method: 'POST',
        body: JSON.stringify(user)
    }).then(res => res.json())
        .then(parsedRes => {
            return { "data": parsedRes, "err": false };
        })
        .catch(err => {
            alert("Something went wrong, sorry!");
            return { "data": err, "err": true };
        })
}

export default sendUser;