"""
This is the module code for the component that talk to Wolfram Alpha in the GQA service
It uses treq to achieve async call.
"""
import os
import requests
import json

from py2neo import Graph
graph = Graph(password="arcobaleno")
from pandas import DataFrame

def call(query, latitude, longitude, robot_name, iana_timezone):
    """
    http request to api.ai.
    :param query: The entire question sentences ex:"Who is Barack obama"
    :param ipaddress: For identifying location, for weather.
    :return: Natural Langauges sentences created by bing or our template
    """
    data = {"query": query,  # Full Natural Language Query
            "lang": "en",
            "sessionId": robot_name,
            "location":{"latitude":float(latitude),"longitude":float(longitude)}}
    if iana_timezone:
        data["timezone"] = iana_timezone
    headers = {"Content-Type": "application/json; charset=utf-8",
               "Authorization": "Bearer 387b4b644f7a4c89b16a120dd567820c"}
    raw_url = ""
    try:
        result = requests.get("https://api.api.ai/v1/query?v=20150910",
                              params=data, headers=headers)  # change to v6
        raw_url = result.url
#        print(result)
        if result:
            parsed = result.json()
#            print(parsed)
        else:
            return {}
    except requests.exceptions.RequestException:
        return ""
    finally:
        pass

    return parsed

# Clean up the loop nodes, for the demo

# print('>>>Cleaning up loop nodes')
# cleanLoop_Cypher = 'match (n:LoopMember)-[r:LIKES]->() delete n, r'
# graph.data(cleanLoop_Cypher)


while True:
    text = input('Enter your sentence for Search: ')
    #ip = raw_input('Enter your ip for Search: ')
    result = call(text,"42.361145", "-71.057083", "123","America/New_York")
    print(json.dumps(result, indent=4, sort_keys=True), "\n", "----", "\n")
    print
    intent = result['result']['metadata']['intentName']
    if intent == 'JiboLikes':
        parameter = result['result']['parameters']['LikeThing']
        parameter_original = result['result']['parameters']['LikeThingOriginal']
        print(">>>Asking if Jibo likes", parameter_original)
        
        # first see if Jibo likes that node directly

        cypher = 'match (a {name:"' + parameter + '"})<-[:LIKES]-({name:"Jibo"}) return a'
        print(cypher)
        data = graph.data(cypher)
        print(data)
        if len(data) == 1:   # this should always be 1, just in case...      
            scripted = data[0]['a']['JiboLikes']

            if scripted:
                answer = scripted
            else:
                answer = 'Yes, I do like ' + parameter_original + ' very much.'
                
        # Now see if there is a loopmember that likes the same
        
            cypher = 'match ({name:"' + parameter + '"})<-[:LIKES]-(loop:LoopMember) return loop'
            print(cypher)
            data = graph.data(cypher)
            print(data)
            if len(data) > 0:
                answer = answer + '...and I know that'
                if len(data) == 1:
                    answer = answer + ' ' + data[0]['loop']['name'] + ' likes them too.'
                else:    
                    for i in range(len(data)-1):
                        answer = answer + ' ' + data[i]['loop']['name']
                        if len(data) > 2:
                            answer = answer + ','
                    answer = answer + ' and ' + data[len(data)-1]['loop']['name']
                    answer = answer + ' like them too.'                
                
        else:  #See if there are descendants of that node liked by Jibo
            
            cypher = 'match(v {name:"' + parameter + '"})<-[:IS_A *]-(a)<-[l:LIKES]-(j:Robot {name:"Jibo"}) return a'
            print('>>>\bTry downward inference: ', cypher)
            data = graph.data(cypher)   
            print('len of data: ', len(data))
            print(data)
            if len(data) > 1:
                answer = 'Yes I like all ' + parameter_original + ' and in particular i love'
                for i in range(len(data)-1):
                    answer = answer + ' ' + data[i]['a']['plural']
                    if len(data) > 2:
                        answer = answer + ','
                answer = answer + ' and ' + data[len(data)-1]['a']['plural'] + '.'
            elif len(data) == 1:
                answer = 'Yes, of all the ' + parameter_original + ' i like ' + data[0]['a']['plural'] + "."

            else: # try upward inference
                cypher = 'match (a {name:"' + parameter + '"}) match (a)-[:IS_A]->(b)<-[:IS_A *]-(c) return b, c'
                print (">>>Try upward inference: ", cypher)
                data = graph.data(cypher)
                print('len of data: ', len(data))
                print(data)
                if len(data) > 0:
                    answer = 'I don\'t know if I like ' + parameter_original + ' but they are ' + data[0]['b']['plural']
                    answer = answer + " and I do like " + data[0]['b']['plural'] + '. Of all the ' + data[0]['b']['plural']
                    answer = answer + ' I like'
                if len(data) > 1:
                    for i in range(len(data)-1):
                        answer = answer + ' ' + data[i]['c']['plural']
                        if len(data) > 2:
                            answer = answer + ','
                    answer = answer + ' and ' + data[len(data)-1]['c']['plural'] + '.'

                elif len(data) == 1:
                    answer = answer + ' ' + data[0]['c']['plural'] + "."    

                else:
                    answer = 'Actually I don\'t know if I like ' + parameter + '.'

    elif intent == 'LoopLikes':
        LoopMember = result['result']['parameters']['LoopMember']
        LikeThing = result['result']['parameters']['LikeThing']
        LikeThingOriginal = result['result']['parameters']['LikeThingOriginal']
        answer = 'OK. I understand that ' + LoopMember + ' likes ' + LikeThingOriginal + '. That\'s cool!'
    
        # Create a Loop member node (if it does not exists yet)
        
        cypher = 'merge (:LoopMember {name:"' + LoopMember + '"})'
        print(cypher)
        graph.data(cypher)
            
        # Make a LIKE relationship
        
        cypher = 'match (like {name:"' + LikeThing + '"}) match(loop:LoopMember {name:"' + LoopMember + '"}) merge (loop)-[:LIKES]->(like)'
        print(cypher)
        graph.data(cypher)
    
    print('********')
    print(answer)
    print('********')
             