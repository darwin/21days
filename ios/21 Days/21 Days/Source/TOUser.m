//
//  21 Days
//
//  Created by Zdenek on 2/13/11.


#import "TOUser.h"
#import "JSON.h"
#import "TORoutine.h"

@implementation TOUser

@synthesize fullName = _fullName;
@synthesize facebookId = _facebookId;
@synthesize startDayIndex = _startDayIndex;
@synthesize routines = _routines;


- (id) init {
    self = [super init];
    if (self != nil) {
        _facebookId = @"";
    }
    return self;
}

- (void) parseServerReply:(NSString*) reply
{
    if (self.facebookId == @"")
        return;
    MyLog(@"Object facebook ID: %@", _facebookId);
    
    id parsedReply = [reply JSONValue];
    
    if (![parsedReply isKindOfClass:[NSDictionary class]])
        return;
    
    NSDictionary* dictionary = (NSDictionary*) parsedReply;
    
    MyLog(@"Parsed dictionary: %@", dictionary);
    
    MyLog(@"Dict Params: %d, %@", [dictionary count], [dictionary allKeys]);

    // Get dictionary for facebook user Id.
    NSDictionary* userDict = [dictionary objectForKey:self.facebookId];
    
    // Get start day index.
    self.startDayIndex = (NSUInteger) [userDict objectForKey:@"start_day"];

    // Get routines array.
    NSArray* routines = [userDict objectForKey:@"routines"];
    MyLog(@"Routine Array: %@", routines);
    
    NSMutableArray* routinesArray = [[NSMutableArray alloc] init];
    
    for (NSDictionary* routine in routines)
    {
        TORoutine* newRoutine = [[TORoutine alloc] initWithDictionary:routine];
        [routinesArray addObject:newRoutine];
        [newRoutine release];
    }
    
    self.routines = [routinesArray copy];
    
}

- (void) parseFacebookReply:(NSString*) reply
{
    // TODO: replace buildUserFromFacebookDictionary
}

@end
