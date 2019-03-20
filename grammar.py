import pymongo
import language_check
import bson
import sys
client = pymongo.MongoClient("localhost", 27017)
db = client.scheduler
print(db.name)
jobs = db.jobs
from bson.objectid import ObjectId
x=[i for i in db.jobs.find({"_id": ObjectId(str(sys.argv[1]))})]
x=x[0]
tool = language_check.LanguageTool('en-US')
matches = tool.check(x['content'])
tobe=language_check.correct(x['content'], matches)
print(tobe)
if x['content']==tobe:
    jobs.update_one({"_id":x['_id']},{"$set":{"Grammar Check":tobe,"Checked":0}})
else:
    jobs.update_one({"_id":x['_id']},{"$set":{"Grammar Check":tobe,"Checked":1}})