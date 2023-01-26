import axios from "axios";

const dbCalls = async (url,method,data) => {
    const config = {
        method,
        url,
        headers: {
            "Content-Type": "application/json"
        },
        data
    };

    await axios(config)
    .then((result) => {
        console.log(result);
      return result.data;
    })
    .catch((error) => {
      return new Error();
    });
}

export default dbCalls;