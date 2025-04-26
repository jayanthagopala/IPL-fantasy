import { Amplify } from 'aws-amplify';
// Remove the Auth import since we're not using authentication anymore
// import { Auth } from 'aws-amplify';

Amplify.configure({
  // Remove the Auth configuration since we're not using it
  API: {
    endpoints: [
      {
        name: 'iplfantasy',
        endpoint: 'https://j59k0dqyjh.execute-api.eu-west-1.amazonaws.com/dev',
        region: 'eu-west-1'
        // Remove the custom_header since we're not using authentication
      }
    ]
  }
}); 