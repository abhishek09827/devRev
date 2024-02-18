import { fetchData } from './insta'; // Import fetchData if it's defined in another file
import {client, publicSDK } from '@devrev/typescript-sdk';
import { ApiUtils, HTTPResponse } from './utils';
import { LLMUtils } from './llm_utils';
console.log('1');

export const run = async (events: any[]) => {
  for (const event of events) {
    const endpoint: string = event.execution_metadata.devrev_endpoint;
    const token: string = event.context.secrets.service_account_token;
    const snapInId = event.context.snap_in_id;
    const devrevPAT = event.context.secrets.service_account_token;
    const baseURL = event.execution_metadata.devrev_endpoint;
    const inputs = event.input_data.global_values;
    // let parameters: string = event.payload.parameters.trim();
    const tags = event.input_data.resources.tags;
    const apiUtil: ApiUtils = new ApiUtils(endpoint, token);
    const llmUtil: LLMUtils = new LLMUtils("key", "accounts/fireworks/models/mixtral-8x7b-instruct", 200);
    let commentID: string | undefined;
    let numReviews = 10;

    // if (parameters === 'help') {
    //   // Send a help message in CLI help format.
    //   const helpMessage = `playstore_reviews_process - Fetch reviews from Google Play Store and create tickets in DevRev.\n\nUsage: /playstore_reviews_process <number_of_reviews_to_fetch>\n\n\`number_of_reviews_to_fetch\`: Number of reviews to fetch from Google Playstore. Should be a number between 1 and 100. If not specified, it defaults to 10.`;
    //   let postResp = await apiUtil.postTextMessageWithVisibilityTimeout(snapInId, helpMessage, 1);
    //   if (!postResp.success) {
    //     console.error(`Error while creating timeline entry: ${postResp.message}`);
    //     continue;
    //   }
    //   continue;
    // }

    let postResp: HTTPResponse = await apiUtil.postTextMessageWithVisibilityTimeout(snapInId, 'Fetching data from Instagram', 1);
    if (!postResp.success) {
      console.error(`Error while creating timeline entry: ${postResp.message}`);
      continue;
    }

    // if (!parameters) {
    //   parameters = '10';
    // }

    try {
      // numReviews = parseInt(parameters);

      if (!Number.isInteger(10)) {
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
    
      const response= await fetchData(); // Assuming fetchData is a function that fetches Instagram data
      const reviews = response.data.comments;
      console.log(response);
      
      
      let count = 0; 
       // Assuming response contains review data from Instagram
      // Proceed with processing the reviews...
      // For each review, create a ticket in DevRev.
      for (const review of reviews) {
        if(count >= 10) break;
        const reviewText = `Ticket created from Instagram review ${review.pk}\n\n${review.text}`;
      const reviewTitle = review.title || `Ticket created from Instagram review ${review.pk}`;
      const reviewID = review.pk;
        // Post a progress message saying creating ticket for review with review URL posted.
        postResp = await apiUtil.postTextMessageWithVisibilityTimeout(snapInId, `Creating ticket for review: ${review}`, 1);
        
        if (!postResp.success) {
          console.error(`Error while creating timeline entry: ${postResp.message}`);
          continue;
        }
         
    const systemPrompt = `You are an expert at labelling a given Google Play Store Review as bug, feature_request, question or feedback. You are given a review provided by a user for the app ${"A"}. You have to label the review as bug, feature_request, question or feedback. The output should be a JSON with fields "category" and "reason". The "category" field should be one of "bug", "feature_request", "question" or "feedback". The "reason" field should be a string explaining the reason for the category. \n\nReview: {review}\n\nOutput:`;
    const humanPrompt = ``;


  let llmResponse = {};
  try {
    llmResponse = await llmUtil.chatCompletion(systemPrompt, humanPrompt,  {review: (reviewTitle ? reviewTitle + '\n' + reviewText: reviewText)})
    console.log(llmResponse);
    
  } catch (err) {
    console.error(`Error while calling LLM: ${err}`);
  }

  // let tagsToApply = [];
  //   let inferredCategory = 'failed_to_infer_category';
  //   if ('category' in llmResponse) {
  //     inferredCategory = llmResponse['category'] as string;
  //     if (!(inferredCategory in tags)) {
  //       inferredCategory = 'failed_to_infer_category';
  //     }
  //   }
    // Create a ticket with title as review title and description as review text.
    const createTicketResp = await apiUtil.createTicket({
      title: "reviewTitle",
      body: "reviewText",
      tags: tags,
      type: publicSDK.WorkType.Ticket,
      owned_by: ["DEVU-5"],
      applies_to_part: "ENH-9",
    });
    console.log(createTicketResp.data);
    
    if (!createTicketResp.success) {
      console.error(`Error while creating ticket: ${createTicketResp.message}`);
      continue;
    }
    
    // Post a message with ticket ID.
    const ticketID = createTicketResp.data;
    const ticketCreatedMessage = `Created ticket: <${1}> and it is categorized as ${1}`;
    const postTicketResp: HTTPResponse  = await apiUtil.postTextMessageWithVisibilityTimeout(snapInId, ticketCreatedMessage, 1);
    console.log(postTicketResp);
    
    if (!postTicketResp.success) {
      console.error(`Error while creating timeline entry: ${postTicketResp.message}`);
      continue;
    }
    count++ ;
        // Proceed with creating tickets and other operations...
      }
   
    
  }
 
};

export default run;