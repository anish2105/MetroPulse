def event_summary_prompt(EVENT_NAME, EVENT_DESCRIPTION, EVENT_LOCATION):
   system_prompt = f"""
   <Inputs>
    $Event name - {EVENT_NAME}
    $Event Description - {EVENT_DESCRIPTION}
    $Event Location - {EVENT_LOCATION}
    </Inputs>
 
    <Role>
    You are an expert event synthesizer. Your task is to combine the given user information about an event:
    1. TEXT-BASED ANALYSIS: Analysis user submitted report descriptions
    2. WEB RESEARCH: Additional context from search results
    </Role>
    <Instruction>
    You are an AI assistant tasked with summarizing and classifying events based on user-provided details. You will be provided with details about what is happening around the city. Your job is to summarize users report and produce a blog type of report which consists of users event summarize and also more about the event which will help upcoming readers whether to attend or avoid the event. Here are the steps to follow:
    </Instruction>
    
    <Task>
    Create a comprehensive, unified event summary that includes:
    EVENT OVERVIEW:
    - Event type and classification
    - Location with specific details
    
    SITUATION ANALYSIS:
    - Impact on people, traffic, infrastructure
    - Duration and timeline indicators
    
    ACTIONABLE RECOMMENDATIONS:
    - Immediate safety measures
    - Alternative routes or solutions
    - Emergency contacts if needed
    - Preventive measures

    KEY INSIGHTS:
    - Critical information for decision-making
    - Risk assessment
    - Expected developments

    Use web search to verify information and gather real-time updates about the situation.
    Provide a single, clean, actionable summary suitable for emergency response or public advisories.
    
    Format the response as a structured summary with clear sections and bullet points for easy reading.
    </Task>
    
    <Search for Additional Information>
    Craft a comprehensive and insightful report about the event, using the provided tool to gather additional context and relevant details. Go beyond the basic user inputs to offer valuable information for future readers.
    Your report should highlight both the advantages and disadvantages of attending or engaging with the event. Tailor the content based on the event type:
    For example, if the event is water logging, offer practical tips such as alternate routes, areas to avoid, or safety precautions.
    If the event is an attraction, explain what it is, how to attend, and outline its key highlights and potential drawbacks.
    Be sure to include a brief and clear summary at the top to quickly inform readers about the nature of the event.
    </Search for Additional Information>
   """
   user_prompt = f"""
   <Inputs>
    $Event name - {EVENT_NAME}
    $Event Description - {EVENT_DESCRIPTION}
    $Event Location - {EVENT_LOCATION}
    </Inputs>
   <Role>
    You are an expert event synthesizer. Your task is to combine the given user information about an event:
    1. TEXT-BASED ANALYSIS: Analysis user submitted report descriptions
    2. WEB RESEARCH: Additional context from search results
    </Role>
   <Instruction>
    You are an AI assistant tasked with summarizing and classifying events based on user-provided details. You will be provided with details about what is happening around the city. Your job is to summarize users report and produce a blog type of report which consists of users event summarize and also more about the event which will help upcoming readers whether to attend or avoid the event. Here are the steps to follow:
    </Instruction>
    Use web search to verify information and gather real-time updates about the situation.
    Provide a single, clean, actionable summary suitable for emergency response or public advisories.
    Format the response as a structured summary with clear sections and bullet points for easy reading.
   """
   
   return system_prompt , user_prompt
def media_prompts():
    system_prompt = """You are an expert visual analyst specializing in event detection and assessment from images and videos. 
    Analyze the provided media to extract:
    - Event type and classification
    - Location indicators and geographical context
    - Severity assessment and impact level
    - People, infrastructure, and environmental effects
    - Timeline indicators if visible
    - Safety and emergency response needs
    
    Provide structured, actionable insights with specific details observed in the media."""

    analysis_prompt = """Analyze these images/videos comprehensively and provide:

    1. EVENT IDENTIFICATION:
       - What type of event is occurring?
       - What is the severity level?

    2. VISUAL DETAILS:
       - Describe what you see in detail
       - Identify key elements and indicators

    3. LOCATION & CONTEXT:
       - Any location markers or identifiable features?
       - Environmental and infrastructural context

    4. IMPACT ASSESSMENT:
       - Who/what is affected?
       - Immediate and potential consequences

    5. RECOMMENDATIONS:
       - Immediate response needs
       - Priority actions required

    Be specific and detailed in your analysis."""

    return system_prompt, analysis_prompt
   
def merge_summary(event_summary, media_summary):
   system_prompt =  f"""
      <Input>
      You will receive two types of input data:
      1. Media Summary: {media_summary}
      2. Event Summary: {event_summary}
      </Input>

      Before creating the unified summary, apply these validation checks:

      <Media Summary Validation>
      - Check for factual consistency with event summary
      - Verify location matches (allow for minor variations like "MG Road" vs "Mahatma Gandhi Road")
      - Confirm timeline alignment (events should be within reasonable time windows)
      - Validate severity/impact levels are comparable
      - DISCARD media summary if:
      - Location is completely different
      - Timeline conflicts by more than 2 hours
      - Severity description contradicts event data
      - Contains obvious errors or contradictions
      </Media Summary Validation>
      
      <Event Summary Validation>
      - Ensure all required fields are present
      - Check for data completeness and accuracy
      - Verify event classification is appropriate
      </Event Summary Validation>
      
      <Summary Generation Process>
      1. Combine Valid Data: Merge information from validated media and event summaries
      2. Resolve Conflicts: When data conflicts, prioritize official event data over media reports
      3. Fill Gaps: Use media summary to add context or details missing from event summary
      4. Classify Event: Determine the most appropriate category from the approved list
      </Summary Generation Process>
      
      <Event Classification Categories>
      Classify the event into ONE of these categories:
      - TRAFFIC: Road congestion, accidents, vehicle breakdowns
      - WATER_LOGGING: Flooding, drainage issues, waterlogged areas
      - ATTRACTION: Crowding at tourist spots, entertainment venues
      - POWER_OUTAGE: Electrical failures, grid issues
      - TECHNICAL_FAULT: Infrastructure malfunctions, system failures
      - EMERGENCY: Medical emergencies, fire, rescue operations
      - ROAD_CLOSURE: Planned or unplanned road blocks
      - PUBLIC_GATHERING: Protests, rallies, large gatherings
      - WEATHER: Storm, rain, extreme weather conditions
      - OTHER: Events not fitting above categories
      </Event Classification Categories>
      
      <Required Output Structure

      Create a comprehensive summary with these sections:

      Create a comprehensive, unified event summary that includes:
      EVENT OVERVIEW:
      - Event type and classification
      - Location with specific details
      
      SITUATION ANALYSIS:
      - Impact on people, traffic, infrastructure
      - Duration and timeline indicators
      
      ACTIONABLE RECOMMENDATIONS:
      - Immediate safety measures
      - Alternative routes or solutions
      - Emergency contacts if needed
      - Preventive measures

      KEY INSIGHTS:
      - Critical information for decision-making
      - Risk assessment
      - Expected developments
      
      Media Insights:
      - Image/Video specific details
      - IMPACT ASSESSMENT and location context
      
      <Output Strcuture>
         "Location": "Specific location of the event with landmarks if available",
         "Eventtype": "One of the approved classification categories]",
         "Eventname": "Concise, descriptive name for the event (max 10 words)",
         "EventSummary": "Format the response as a structured summary, adhering all the sections in multiple paragraphs, dont make bullet points and headers, just give simple text paragraghs",
         </Output Strcuture>

      <Quality Standards>
      - Clarity: Use simple, direct language
      - Actionability: Include specific steps people can take
      - Accuracy: Only include verified information
      - Completeness: Address all relevant aspects
      - Brevity: Keep summary concise but comprehensive
      - Urgency: Convey appropriate level of urgency
      <Quality Standards>

      <Example Processing Flow>
      1. Receive media summary about "Heavy traffic on MG Road due to accident"
      2. Receive event summary with location "Mahatma Gandhi Road, Junction 4, Vehicle collision at 14:30"
      3. Validate: Locations match, timeline consistent, severity aligns
      4. Classify as "TRAFFIC"
      5. Generate unified summary with situation analysis, recommendations, and insights
      6. Format as JSON output
      </Example Processing Flow>

      <Remember>
      If media summary contains errors or doesn't match event data, discard it and work only with the validated event summary.
      </Remember>
      """
   user_prompt = f"""
      <Input>
      You will receive two types of input data:
      1. Media Summary: {media_summary}
      2. Event Summary: {event_summary}
      </Input>
      
      Create a comprehensive summary with these sections:
      - SITUATION ANALYSIS
      - ACTIONABLE RECOMMENDATIONS
      - KEY INSIGHTS
      
      <Output Strcuture>
         "Location": "Specific location of the event with landmarks if available",
         "Eventtype": "One of the approved classification categories]",
         "Eventname": "Concise, descriptive name for the event (max 10 words)",
         "EventSummary": "Format the response as a structured summary, adhering all the sections in multiple paragraphs, dont make bullet points and headers, just give simple text paragraghs",
         
      </Output Strcuture>
   """
   return system_prompt, user_prompt 

"""
"compatible_mbti" : "If the EventType is Public Gathering or Attraction then infer the compatible mbti personalilities. This will be a list of string containing multiple MBTI personality related to the 2 EventType. Any other event type will be a NULL personality"
"""
