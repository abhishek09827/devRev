import { fetchData } from './insta'; // Import fetchData if it's defined in another file
import {client, publicSDK } from '@devrev/typescript-sdk';
import { ApiUtils, HTTPResponse } from './utils';
import { performAnalysis } from './llm_utils';
// import { fetchTimeline } from './twitter';

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
    
      // const response= await fetchData(); // Assuming fetchData is a function that fetches Instagram data
      // const reviews = response.data.comments;
      // console.log(response);
      
      const reviews: string[] = [
        "I absolutely love the new update! The interface is much cleaner and more intuitive.",
        "Unfortunately, the app crashes frequently on my device since the last update. I hope this gets fixed soon.",
       ];
      let count = 0; 
       // Assuming response contains review data from Instagram
      // Proceed with processing the reviews...
      // For each review, create a ticket in DevRev.
      for (const review of reviews) {
        if(count >= 10) break;
        
        // Post a progress message saying creating ticket for review with review URL posted.
        postResp = await apiUtil.postTextMessageWithVisibilityTimeout(snapInId, `Creating ticket for review: ${review}`, 1);
        console.log(postResp);
        
        if (!postResp.success) {
          console.error(`Error while creating timeline entry: ${postResp.message}`);
          continue;
        }
        const reviewText = `Ticket created from Instagram review ${"review.pk"}\n\n${review}`;
        const reviewTitle = "review.title" || `Ticket created from Instagram review ${"review.pk"}`;
        const reviewID = "review.pk";

    
    const llmResponse = await performAnalysis(review)
  console.log(llmResponse);
  
  const parsedData = JSON.parse(llmResponse.entityTagging);

// Get category
const category = parsedData.category;
  const entityTaggingCategories = category;
  console.log(entityTaggingCategories);
  
  // const entityTaggingCategories = llmResponse.entityTagging.entities.reduce((categories: Categories, entity: any) => {
  //   categories[entity.category.entity] = entity.category.type;
  //   return categories;
  // }, {});

  
  

  
   

  console.log("before");
    // Create a ticket with title as review title and description as review text.
    const createTicketResp = await apiUtil.createTicket({
      title: reviewTitle,
      body: review,
      tags: entityTaggingCategories,
      type: publicSDK.WorkType.Ticket,
      owned_by: ["DEVU-5"],
      applies_to_part: "ENH-9",
    });
    console.log("response",createTicketResp);
    
    
    // if (!createTicketResp.success) {
    //   console.error(`Error while creating ticket: ${createTicketResp.message}`);
    //   continue;
    // }
  
    // Post a message with ticket ID.
    // const ticketID = createTicketResp.data;
    const ticketCreatedMessage = `Created ticket and it is categorized as ${entityTaggingCategories}`;
    const postTicketResp: HTTPResponse  = await apiUtil.postTextMessageWithVisibilityTimeout(snapInId, ticketCreatedMessage, 1);
    console.log(2);
    
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
