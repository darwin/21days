#import <Foundation/Foundation.h>

@interface TOUser : NSObject {
    
}

@property (nonatomic, copy) NSString* fullName;
@property (nonatomic, copy) NSString* facebookId;
@property (nonatomic, assign) NSUInteger startDayIndex;
@property (nonatomic, retain) NSArray* routines;


// Parses 21 Days server reply (JSON).
- (void) parseServerReply:(NSString*) reply;

// Parses Facebook server reply (JSON).
- (void) parseFacebookReply:(NSString*) reply;

@end
