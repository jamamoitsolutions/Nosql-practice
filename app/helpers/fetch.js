/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

var axios = require("axios");

/**
 * Attaches a given access token to a MS Graph API call
 * @param endpoint: REST API endpoint to call
 * @param accessToken: raw access token string
 */
async function fetch(method, endpoint, payload, accessToken) {
  const options = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  };

  //console.log(`request made to ${endpoint} at: ` + new Date().toString());

  try {
    let response;
    if (method == "get") {
      //console.log("method get");
      response = await axios.get(endpoint, options);
    } else if (method == "post") {
      // console.log("method post");
      response = await axios.post(endpoint, payload, options);
    } else if (method == "patch") {
      //console.log("method patch");
      response = await axios.patch(endpoint, payload, options);
    } else if (method == "delete") {
      //console.log("method delete");
      response = await axios.delete(endpoint, options);
    } else {
      console.log("method not found");
      // nothing
    }

    // console.log("fetch response ", response)
    return await response;
  } catch (error) {
    // console.log("fetch errorresponse ", error);
    return await error?.response;
  }
}

module.exports = fetch;
