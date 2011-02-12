#import <UIKit/UIKit.h>
#import "Facebook.h"

@interface TOUserTableViewController : UITableViewController <FBSessionDelegate, FBRequestDelegate> {
    NSArray* _permissions;
    BOOL _isConnectedToFacebook;
}

@property(readonly) Facebook* facebook;

// Returns YES if we have connection to the Facebook.
- (BOOL) IsConnectedToFacebook;

// Builds user cell.
- (void) BuildUserCell:(UITableViewCell*) cell;

// Builds cell for login / logout.
- (void) BuildConnectionCell:(UITableViewCell*) cell;

// Returns User' cell.
- (UITableViewCell*) GetUserCell;

// Returns Connection cell.
- (UITableViewCell*) GetConnectionCell;

@end
