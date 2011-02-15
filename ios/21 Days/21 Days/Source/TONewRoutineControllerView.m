//
//  21 Days
//
//  Created by Zdenek on 2/13/11.

#import "TONewRoutineControllerView.h"


@implementation TONewRoutineControllerView

@synthesize delegate = _delegate;
@synthesize routineTextField = _routineTextField;

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
        // Custom initialization
    }
    return self;
}

- (void)dealloc
{
    [super dealloc];
}

- (void)didReceiveMemoryWarning
{
    // Releases the view if it doesn't have a superview.
    [super didReceiveMemoryWarning];
    
    // Release any cached data, images, etc that aren't in use.
}

#pragma mark - View lifecycle

- (void)viewDidLoad
{
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
    self.title = @"Add New Routine";
    self.routineTextField.delegate = self;
}

- (void)viewDidUnload
{
    [super viewDidUnload];
    // Release any retained subviews of the main view.
    // e.g. self.myOutlet = nil;
}

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
{
    // Return YES for supported orientations
    return (interfaceOrientation == UIInterfaceOrientationPortrait);
}

#pragma mark - 
- (IBAction)AddButtonPressed:(id)sender 
{
    MyLog(@"Add Routine button pressed");
    [self.navigationController popViewControllerAnimated:YES];
    
    [self.delegate AddNewRoutineWithName:self.routineTextField.text];
}

#pragma mark -

- (BOOL)textFieldShouldReturn:(UITextField *)textField {
	[self.routineTextField resignFirstResponder];
	return TRUE;
}


@end
