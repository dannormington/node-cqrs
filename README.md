Node CQRS
==============

CQRS pattern implemented using node. The example code includes both a base set of classes as well as a sample domain model, events, and set of endpoints to interact.

This implementation is inspired by Greg Young's Simple CQRS C# example
located at https://github.com/gregoryyoung/m-r


Note
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
One question that consistently pops up on the CQRS forums deals with uniqueness. More specifically it comes up with regards to a separate read and write store due to eventual consistency. It is common when implementing CQRS to persist state to an event store and then populate your read models for querying to a completely different location. The read models are typically denormalized SQL tables or documents to provide a fast query layer for screens and reporting needs. With that said, it is also incorrect to assume that this is the only way to implement CQRS. If your app needs full consistency then a separate read/write store may not be the best solution.

Whether the need is a unique username, email, or an order number it seems to be asked a lot. There are a few different ways to deal with uniqueness when using different storage for read/write. All businesses are different. The impact of duplicate values should be assessed.

For the possible solutions below assume the following:

  1. username or email address uniqueness is in question.
  2. There is a primary read SQL table or document DB collection to store the read model where the username/email has been specified with a unique key.

### Possible Solutions
  1. Allow the registration to go through without checking for uniqueness. More than likely this will cause some sort of a helpdesk call because the user may not be able to login or experience other technical difficulties. The helpdesk technician can help guide the user through a way to fix the issue or report to IT staff to manually fix the problem.
  2. Allow the registration to go through without checking for uniqueness. Once the event handler is triggered to populate the read model simply check that model for your unique value to see if it exists. If the value doesn't exist then create a new record in your read model. If the value does exist one option would be to temporarily disable the account and email the user notifying them that they need to change their username/email. Provide the user wit an interface to fix the issue.
  3. Within the command handler check the read model for uniqueness. This could be considered as part of the logic that validates the command. If not found, processess as usual. If it is found the command is not accepted and this can be reported through your API. I would still suggest checking for uniqueness again inside of the event handler prior to populating the read model. While it is unlikely it is possible that with a race condition it could have been registered somewhere between the first check and the event being published.
  4. ...

For this particular example I went with option 3.
