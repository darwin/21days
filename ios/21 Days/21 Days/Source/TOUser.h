#import <Foundation/Foundation.h>

@interface TOUser : NSObject {
    
}

@property (nonatomic, copy) NSString* fullName;
@property (nonatomic, copy) NSString* facebookId;
@property (nonatomic, assign) NSUInteger startDayIndex;
@property (nonatomic, retain) NSArray* routines;

- (void) parseServerReply:(NSString*) reply;
- (void) parseFacebookReply:(NSString*) reply;

@end
