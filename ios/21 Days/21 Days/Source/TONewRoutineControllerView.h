//
//  21 Days
//
//  Created by Zdenek on 2/13/11.

#import <UIKit/UIKit.h>


@protocol TONewRoutineControllerViewDelegate

- (void) AddNewRoutineWithName:(NSString*) name;

@end

@interface TONewRoutineControllerView : UIViewController <UITextFieldDelegate> {
    
}

@property (nonatomic, assign) id delegate;
@property (nonatomic, assign) IBOutlet UITextField* routineTextField;

- (IBAction)AddButtonPressed:(id)sender;

@end
