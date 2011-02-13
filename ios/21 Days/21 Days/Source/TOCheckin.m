//
//  21 Days
//
//  Created by Zdenek on 2/13/11.

#import "TOCheckin.h"

@implementation TOCheckin

@synthesize dayIndex = _dayIndex;
@synthesize checked = _checked;

- (id) initWithDictionary:(NSDictionary*)dictionary dayIndex:(id)day
{
    self = [super init];
    if (self != nil && dictionary != nil) {
        
        MyLog(@"TOCheckin initWithDictionary: %@", dictionary);
        MyLog(@"Checkin keys: %@", [dictionary allKeys]);
        MyLog(@"id: %@", day);
        self.dayIndex = [(NSString*)day integerValue];
        self.checked = [(NSString*)[dictionary objectForKey:@"checked"] boolValue];

        MyLog(@"%d, %d", self.dayIndex, self.checked);
    }
    return self;

}

@end
