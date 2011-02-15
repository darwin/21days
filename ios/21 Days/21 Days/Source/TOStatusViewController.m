//
//  21 Days
//
//  Created by Zdenek on 2/13/11.

#import "TOStatusViewController.h"
#import "TONewRoutineControllerView.h"
#import "TORoutineViewController.h"

@implementation TOStatusViewController

@synthesize thisWeekView = _thisWeekView;
@synthesize loginLabel = _loginLabel;

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
    }
    return self;
}

- (void)dealloc
{
    [super dealloc];
    [_routines release];
    _routines = nil;
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
    self.title = @"21 Days";
	self.navigationItem.rightBarButtonItem.target = self;
	self.navigationItem.rightBarButtonItem.action = @selector(AddRoutine:);
    
    _routines = [[NSMutableArray alloc] initWithCapacity:6];
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

#pragma mark - Navigation handling

- (IBAction)AddRoutine:(id)sender
{
    MyLog(@"Add Routine request");
    
    TONewRoutineControllerView* newRoutine = [[TONewRoutineControllerView alloc] initWithNibName:@"TONewRoutineView" bundle:nil];
    newRoutine.delegate = self;
    
    [self.navigationController pushViewController:newRoutine animated:YES];
    
    //[newRoutine release];    
}

#pragma mark - Routines management

- (void) AddRoutineViewControllerWithName:(NSString*) name
{
    // TODO: use header bounds
    //CGRect headerBounds = [self.thisWeekView bounds];
    CGFloat initialOffset = 51;
    CGFloat routineHeight = 75;
    NSUInteger numberOfRoutines = [_routines count];
    
    // Create routine
    TORoutineViewController* routineViewController = [[TORoutineViewController alloc] initWithNibName:nil bundle:nil];
    [routineViewController setRoutine:name];
    
    [_routines addObject:routineViewController];
    
    [self.view addSubview:routineViewController.view];
    
    CGRect routineFrame = routineViewController.view.frame;
    
    [UIView beginAnimations:nil context:nil];
	[UIView setAnimationDuration:0.5];

    routineFrame.origin.y += initialOffset + (routineHeight + 1) * numberOfRoutines;
    routineViewController.view.frame = routineFrame;
    
	[UIView commitAnimations];
}

- (void) AddNewRoutineWithName:(NSString*) name
{
    [self AddRoutineViewControllerWithName:name];
}

- (void) FacebookConnected
{
    MyLog(@"Fetching data from 21 Days...");
    [self AddRoutineViewControllerWithName:@"Eat vegetarian twice a week."];

    self.loginLabel.hidden = YES;
    self.navigationItem.rightBarButtonItem.enabled = YES;
}

- (void) FacebookDisconnected
{
    MyLog(@"Clear all data");
    self.loginLabel.hidden = NO;
    self.navigationItem.rightBarButtonItem.enabled = NO;    
    
    for (TORoutineViewController* rvc in _routines)
    {
        [rvc.view removeFromSuperview];
        [rvc release];
        rvc = nil;
    }

    [_routines removeAllObjects];
}

@end
