//
//  21 Days
//
//  Created by Zdenek on 2/13/11.

#import <UIKit/UIKit.h>

@class TOUserTableViewController;
@class TOStatusViewController;

@interface TO21DaysAppDelegate : NSObject <UIApplicationDelegate> {

}

@property (nonatomic, retain) IBOutlet UIWindow *window;
@property (nonatomic, retain) IBOutlet UITabBarController* tabBarController;
@property (nonatomic, assign) IBOutlet TOUserTableViewController* userTableViewController;
@property (nonatomic, assign) IBOutlet TOStatusViewController* statusViewController;

@end
