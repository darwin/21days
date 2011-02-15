//
//  21 Days
//
//  Created by Zdenek on 2/13/11.

#import <UIKit/UIKit.h>
#import "TONewRoutineControllerView.h"
#import "TOUserTableViewController.h"

@interface TOStatusViewController : UIViewController <TONewRoutineControllerViewDelegate, FacebookConnectionDelegate> {
    NSMutableArray* _routines;
}

@property (nonatomic, assign) IBOutlet UIView* thisWeekView;
@property (nonatomic, assign) IBOutlet UILabel* loginLabel;

// Presents View for adding new routine.
- (IBAction)AddRoutine:(id)sender;

// Add a new routine view controller.
- (void) AddRoutineViewControllerWithName:(NSString*) name;

@end
