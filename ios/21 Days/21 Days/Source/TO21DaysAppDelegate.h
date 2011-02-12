#import <UIKit/UIKit.h>

@class TOUserTableViewController;

@interface TO21DaysAppDelegate : NSObject <UIApplicationDelegate> {

}

@property (nonatomic, retain) IBOutlet UIWindow *window;
@property (nonatomic, retain) IBOutlet UITabBarController* tabBarController;
@property (nonatomic, assign) IBOutlet TOUserTableViewController* userTableViewController;

@end
