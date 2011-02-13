#import <Foundation/Foundation.h>

@interface TORoutine : NSObject {

}

@property (nonatomic, copy) NSString* name;
@property (nonatomic, assign) NSInteger frequency;
@property (nonatomic, assign) NSInteger order;
@property (nonatomic, retain) NSArray* checkins;

// Inits with dictionary formed from Routine section of 21 Days JSON.
- (id) initWithDictionary:(NSDictionary*)dictionary;

@end
