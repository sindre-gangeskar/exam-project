let queue = [];
let redirectQueue = [];
let timeoutId;
export default class Client {
  async fetch(endpoint, method, body = null) {
    try {
      const response = await fetch(`http://localhost:3001/${endpoint}`, {
        method: method.toUpperCase().trim(),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        ...(body ? { body: JSON.stringify(body, null, 2) } : {})
      })

      /* If the response is ok, return it to the client */
      if (response.ok) return response;

      /* 
      If the response isn't ok, check the content type to make sure it's json and throw the error with the response's json data. 
      otherwise - throw a more generic error 
      */
      else {
        if (response.headers.get('content-type').includes('application/json')) {
          const data = await response.json();
          const error = new Error(data.data.result);
          error.name = data.data.error;
          error.status = data.data.statusCode;
          throw error;
        }
        else {
          const error = new Error(response.statusText || 'Internal Server Error');
          error.name = response.statusText || 'InternalServerError';
          error.status = response.status || 500;
          throw error;
        }
      }
    } catch (error) {
      console.error(error);
      const unauthorizedErrors = [ 'InvalidCredentialsError', 'AdminRequiredError' ];

      /* Display this error message if the user correctly types in credentials but the user in question doesn't have admin privileges */
      if (unauthorizedErrors.includes(error.name))
        this.displayClientMessage('error', error.name, error.message, 4000)

      /* If the status returns a 401 due to a token expiration or malformity in the token, redirect the user back to the login screen */
      if (error.status === 401 && !unauthorizedErrors.includes(error.name)) {
        this.displayClientMessage('error', error.name, `Your session has expired or your token may be malformed, redirecting to login page in 3 seconds...`, 4000)
        this.redirect('', 3000);
      }

      /* Display an error message for the client if it's irrelevant to any unauthorized errors */
      if (error.status && error.status !== 401) this.displayClientMessage('error', error.name, error.message);
    }
  }

  displayClientMessage(type, title, message, duration = 2500) {
    const alertWrapper = document.getElementById('client-alert-wrapper');
    const alertTitle = document.getElementById('client-alert-title');
    const alertMessage = document.getElementById('client-alert-message');

    /* Remove all the alert variant classes beforehand to correctly display the only relevant one */
    const alertTypes = [ 'alert-danger', 'alert-success', 'alert-warning' ];
    alertWrapper.classList.remove(...alertTypes);

    alertTitle.innerText = title;
    alertMessage.innerText = message;
    alertWrapper.classList.add(type == 'success' ? 'alert-success' : type == 'warning' ? 'alert-warning' : 'alert-danger');
    alertWrapper.classList.add('show');

    /* If the queue isn't empty, reset the timeout to allow the new message to show with its own duration */
    if (queue.length > 0) clearTimeout(timeoutId);


    /* Push the timeout to the queue, and remove the show class from the message */
    queue.push(timeoutId = setTimeout(() => {
      alertWrapper.classList.remove('show')
      queue.pop();
    }, duration))
  }

  redirect(endpoint = '', timeToWait = 3000) {
    if (redirectQueue.length > 0) return;
    redirectQueue.push(setTimeout(() => { window.location.href = endpoint }, timeToWait));
  }
}
