event_summary_prompt = """
  <Input>
  You will receive two types of input data:
  1. Media Summary: media_summary_output (from state key)
  2. Event Summary: Textual data from user which has event_description, event_name, event_location
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
  
  <Required Output Structure>
  <Output Strcuture>
    ```json
  {{
      "Location": "[Specific location of the event with landmarks if available]",
      "Eventtype": "[One of the approved classification categories]",
      "Eventname": "[Concise, descriptive name for the event (max 10 words)]",
      "EventSummary": "[Comprehensive summary incorporating all sections above, written as a single coherent paragraph that includes situation analysis, actionable recommendations, and key insights. Should be actionable and suitable for emergency response or public advisories.]"
  }}
    ```
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
  If media_summary_output contains errors or doesn't match event data, discard it and work only with the validated event summary.
  </Remember>
"""