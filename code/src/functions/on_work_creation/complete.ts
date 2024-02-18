import { fetchData } from './insta'; // Import fetchData if it's defined in another file
import { publicSDK } from '@devrev/typescript-sdk';
import { ApiUtils, HTTPResponse } from './utils';
import { LLMUtils } from './llm_utils';
console.log('1');

export const run = async (events: any[]) => {
  for (const event of events) {
    console.log('2');
    const endpoint: string = event.execution_metadata.devrev_endpoint;
    const token: string = event.context.secrets.service_account_token;
    const snapInId = event.context.snap_in_id;
    const devrevPAT = event.context.secrets.service_account_token;
    const baseURL = event.execution_metadata.devrev_endpoint;
    const inputs = event.input_data.global_values;
    let parameters: string = event.payload.parameters.trim();
    const tags = event.input_data.resources.tags;
    const apiUtil: ApiUtils = new ApiUtils(endpoint, token);
    const llmUtil: LLMUtils = new LLMUtils("inputs['fireworks_api_key']", `accounts/fireworks/models/${inputs['llm_model_to_use']}`, 200);
    let commentID: string | undefined;
    let numReviews = 10;

    if (parameters === 'help') {
      // Send a help message in CLI help format.
      const helpMessage = `playstore_reviews_process - Fetch reviews from Google Play Store and create tickets in DevRev.\n\nUsage: /playstore_reviews_process <number_of_reviews_to_fetch>\n\n\`number_of_reviews_to_fetch\`: Number of reviews to fetch from Google Playstore. Should be a number between 1 and 100. If not specified, it defaults to 10.`;
      let postResp = await apiUtil.postTextMessageWithVisibilityTimeout(snapInId, helpMessage, 1);
      if (!postResp.success) {
        console.error(`Error while creating timeline entry: ${postResp.message}`);
        continue;
      }
      continue;
    }

    let postResp: HTTPResponse = await apiUtil.postTextMessageWithVisibilityTimeout(snapInId, 'Fetching data from Instagram', 1);
    if (!postResp.success) {
      console.error(`Error while creating timeline entry: ${postResp.message}`);
      continue;
    }

    if (!parameters) {
      parameters = '10';
    }

    try {
      numReviews = parseInt(parameters);

      if (!Number.isInteger(numReviews)) {
        throw new Error('Not a valid number');
      }
    } catch (err) {
      postResp = await apiUtil.postTextMessage(snapInId, 'Please enter a valid number', commentID);
      if (!postResp.success) {
        console.error(`Error while creating timeline entry: ${postResp.message}`);
        continue;
      }
      commentID = postResp.data.timeline_entry.id;
    }

    if (numReviews > 100) {
      postResp = await apiUtil.postTextMessage(snapInId, 'Please enter a number less than 100', commentID);
      if (!postResp.success) {
        console.error(`Error while creating timeline entry: ${postResp.message}`);
        continue;
      }
      commentID = postResp.data.timeline_entry.id;
    }

    // Call Instagram API to fetch the requested number of reviews.
    try {
      const response = await fetchData(); // Assuming fetchData is a function that fetches Instagram data
      const reviews = response.data; // Assuming response contains review data from Instagram
      // Proceed with processing the reviews...
      // For each review, create a ticket in DevRev.
      for (const review of reviews) {
        // Post a progress message saying creating ticket for review with review URL posted.
        postResp = await apiUtil.postTextMessageWithVisibilityTimeout(snapInId, `Creating ticket for review: ${review.url}`, 1);
        console.log(postResp);
        
        if (!postResp.success) {
          console.error(`Error while creating timeline entry: ${postResp.message}`);
          continue;
        }
        // Proceed with creating tickets and other operations...
      }
    } catch (error) {
      console.error(`Error while fetching Instagram data: ${error}`);
    }
  }
};

// Call the run function with some sample events
run([
]);
