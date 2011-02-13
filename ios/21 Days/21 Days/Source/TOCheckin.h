//
//  21 Days
//
//  Created by Zdenek on 2/13/11.


#import <Foundation/Foundation.h>

@interface TOCheckin : NSObject {
    
}

@property (nonatomic, assign) NSInteger dayIndex;
@property (nonatomic, assign) BOOL checked;

- (id) initWithDictionary:(NSDictionary*)dictionary dayIndex:(id)day;

@end
