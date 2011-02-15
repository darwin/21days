//
//  21 Days
//
//  Created by Zdenek on 2/13/11.

#import <UIKit/UIKit.h>

@class TOCheckUIButton;

@interface TORoutineViewController : UIViewController {
}

@property (nonatomic, assign) IBOutlet UILabel* routineName; 
@property (nonatomic, retain) TOCheckUIButton* mondayButton;

- (void) setRoutine:(NSString*) name;

@end
