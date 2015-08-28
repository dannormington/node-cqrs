Node CQRS with Event Sourcing
==============

CQRS pattern implemented using node. The example code includes both a base set of classes as well as a sample domain model, events, and set of endpoints to interact.

This implementation is inspired by Greg Young's Simple CQRS C# example
located at https://github.com/gregoryyoung/m-r


Why?
----
The purpose of the repo was to learn some node while applying patterns I enjoy working with. I'm sure there are several areas that experienced node developers would choose to implement differently. I welcome comments and suggestions.

Application Domain
------------------
The domain for this particular example is conference registration. Since this sample application is supposed to be "simple" the only behaviors at this point are:
- Registration
- Change your email
- Confirm your new email

Eventual Consistency and Uniqueness
-----------------------------------
One question that consistently pops up on the CQRS forums deals with uniqueness. More specifically it comes up when the developer chooses to use a different read and write store. Although it isn't required, more often it is implemented with the assumption of eventual consistency since read models are updated asychronously. It is common when implementing CQRS to persist state to an event store and then populate your read models asynchronously for querying and reporting purposes to a completely different location and possibly technology. The read models are typically denormalized SQL tables or documents to provide fast queries for screens and reporting needs. With that said, it is also incorrect to assume that this is the only way to implement CQRS. If your app needs full consistency it isn't required that your read models are populated asynchronously. Although you may give up the benefit of speed and efficiency when processing commands there is nothing stating that you can't persist your state to an event store, then update read models all within the same request. It is also incorrect to assume that an event store is required, or storing transactional data and read data separately for that matter. Although through my experiences I've found it difficult to create a clean domain model while using a SQL backend through an ORM, it is completely acceptable. The primary foundation of CQRS is to separate your read and write logic. The CQS pattern basically states that a function that queries data should not change state. CQRS takes it one step further by physically separating reads from writes to different modules or classes for instance.

Whether the need is a unique username, email, or an order number it seems to be asked a lot. There are a few different ways to deal with uniqueness when using different storage for read/write. All businesses are different. The impact of duplicate values should be assessed.

For the possible solutions below assume the following:

  1. username or email address uniqueness is in question.
  2. There is a primary read SQL table or document DB collection to store the read model where the username/email has been specified with a unique key. This becomes the source to check for uniqueness when validating commands.

### Possible Solutions
  1. Allow the registration to go through without checking for uniqueness. More than likely this will cause some sort of a helpdesk call because the user may not be able to login or experience other technical difficulties. The helpdesk technician can help guide the user through a way to fix the issue or report to IT staff to manually fix the problem.
  2. Allow the registration to go through without checking for uniqueness. Once the event handler is triggered to populate the read model simply check that model for your unique value to see if it exists. If the value doesn't exist then create a new record in your read model. If the value does exist one option would be to temporarily disable the account and email the user notifying them that they need to change their username/email. Provide the user with an interface to fix the issue.
  3. Within the command handler check the read model for uniqueness. This could be considered as part of the logic that validates the command. If not found, processess as usual. If it is found the command is not accepted and this can be reported through your API. I would still suggest checking for uniqueness again inside of the event handler prior to populating the read model. While it is unlikely it is possible that with a race condition it could have been registered somewhere between the first check and the event being published.

For this particular example I went with option 3.
