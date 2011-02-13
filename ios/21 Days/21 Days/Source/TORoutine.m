//
//  21 Days
//
//  Created by Zdenek on 2/13/11.

#import "TORoutine.h"
#import "TOCheckin.h"

@implementation TORoutine

@synthesize name = _name;
@synthesize frequency = _frequency;
@synthesize order = _order;
@synthesize checkins = _checkins;

- (id) initWithDictionary:(NSDictionary*)dictionary
{
    self = [super init];
    if (self != nil && dictionary != nil) {
        
        MyLog(@"TORoutine initWithDictionary: %@", dictionary);
        self.name = [dictionary objectForKey:@"name"];
        self.order = [(NSString*)[dictionary objectForKey:@"order"] integerValue];
        self.frequency = [(NSString*)[dictionary objectForKey:@"frequency"] integerValue];
        
        NSDictionary* checkinsDict = [dictionary objectForKey:@"checkins"];
        
        MyLog(@"Check: %@, class: %@", checkinsDict, NSStringFromClass([checkinsDict class]));
        MyLog(@"name: %@, order: %d, frequency: %d", self.name, self.order, self.frequency);
        
        NSMutableArray* checkinsArray = [[NSMutableArray alloc] init];
        
        for (id checkinKey in checkinsDict)
        {
            TOCheckin* newCheckin = [[TOCheckin alloc] initWithDictionary:[checkinsDict objectForKey:checkinKey] dayIndex:checkinKey];
            [checkinsArray addObject:newCheckin];
            [newCheckin release];
        }
        
        [checkinsArray release];
    }
    return self;
}

@end
