//
//  21 Days
//
//  Created by Zdenek on 2/13/11.


#import <UIKit/UIKit.h>
#import "Facebook.h"

@class TOUser;

@protocol FacebookConnectionDelegate <NSObject>

- (void) FacebookConnected;
- (void) FacebookDisconnected;

@end

@interface TOUserTableViewController : UITableViewController <FBSessionDelegate, FBRequestDelegate> {
    NSArray* _permissions;
    BOOL _isConnectedToFacebook;
}

@property(readonly) Facebook* facebook;
@property(nonatomic, assign) id delegate;

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
