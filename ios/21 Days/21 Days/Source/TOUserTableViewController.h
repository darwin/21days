#import <UIKit/UIKit.h>
#import "Facebook.h"

@class TOUser;

@interface TOUserTableViewController : UITableViewController <FBSessionDelegate, FBRequestDelegate> {
    NSArray* _permissions;
    BOOL _isConnectedToFacebook;
}

@property(readonly) Facebook* facebook;

// Returns YES if we have connection to the Facebook.
- (BOOL) isConnectedToFacebook;

// Builds user cell.
- (void) buildUserCell:(UITableViewCell*) cell;

// Builds cell for login / logout.
- (void) buildConnectionCell:(UITableViewCell*) cell;

// Returns User' cell.
- (UITableViewCell*) getUserCell;

// Returns Connection cell.
- (UITableViewCell*) getConnectionCell;

// Builds user Object from facebook Graph reply.
- (TOUser*) buildUserFromFacebookDictionary:(NSDictionary*)result;

@end
