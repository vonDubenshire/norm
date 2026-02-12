// Norm MacDonald-style jokes about Mitt Romney
const jokes = [
    "You know, Mitt Romney says he's just like regular folks. Yeah, just like regular folks who strap their dog to the roof of their car for a 12-hour drive. That's what I do every Sunday after church. Take old Buster up to the roof rack, tell him to enjoy the scenery.",
    "Mitt Romney was talking to some wealthy donors and he said 47 percent of Americans don't pay income taxes and consider themselves victims. You know what I call people who don't pay taxes and consider themselves victims? My accountant.",
    "They say Romney flip-flops on issues. I don't know about that. I think he's very consistent. He consistently tells people exactly what they want to hear at that exact moment. That's not flip-flopping, that's just good customer service.",
    "Romney said his wife Ann drives a couple of Cadillacs. A couple of Cadillacs. You know, I drive a couple of cars too. My 1997 Honda Civic and... well, that's it. Just the one car. But I call it a couple because sometimes I pretend it's two different cars.",
    "At a debate, Romney talked about having 'binders full of women.' Now, I've heard of little black books, but binders full of women? What is he, running for president or starting a very organized brothel?",
    "Romney says he has friends who are NASCAR team owners. That's like me saying I like music because I know someone who owns a record store. 'Do you like NASCAR, Mitt?' 'Well, I wouldn't say I like it, but I do own several people who like it.'",
    "They say Mitt Romney looks presidential. Yeah, if the president was a guy who sells insurance and belongs to three different country clubs. He's got that look like he's about to ask you if you've considered a whole life policy.",
    "Romney went to Harvard Business School and Harvard Law School. You know what I learned at Harvard? Nothing, because I never went there. But I bet if I did go, I'd learn how to put a dog on a car roof real good.",
    "Mitt Romney is a Mormon. Now, I don't know much about Mormons, but I do know they don't drink coffee or alcohol. So basically, Mitt Romney has never experienced the two things that make regular people tolerable to be around.",
    "Romney said he's 'severely conservative.' Severely conservative. That's like saying you're 'aggressively moderate' or 'violently reasonable.' I guess regular conservative wasn't conservative enough. He had to kick it up a notch.",
    "They say Romney made millions buying companies and then firing people. You know what that makes him? A very successful guy who's really bad at making friends at work. 'Hey Mitt, want to grab lunch?' 'Sorry, can't. Too busy eliminating your position.'",
    "Romney's dog got diarrhea during that famous car trip. You know what that tells me? Even his own dog couldn't stomach his policies. That dog was literally expressing what we all felt inside.",
    "At one point, Romney said he met a 7-foot-tall guy and figured he had to be 'in sport.' In sport. Not sports, sport. What is he, from 1847? Next he's going to ask someone if they're 'in industry' or 'in commerce.'",
    "Romney had a hard time connecting with regular voters. You know why? Because when you make more money in one day than most people make in a year, it's hard to relate. 'I understand your struggles. Sometimes I have to choose between the yacht and the helicopter too.'",
    "They criticized Romney for saying corporations are people. Well, if corporations are people, then Mitt Romney is a corporation pretending to be a people. And he's not very good at it.",
    "Romney's campaign slogan was 'Restore Our Future.' Restore our future. That doesn't make sense. You can't restore something that hasn't happened yet. That's like saying 'Let's fix tomorrow.' Tomorrow's not broken, it's just not here yet.",
    "You know what Mitt Romney's biggest problem was? He looked like he was always doing math in his head. You'd ask him how he's doing and he'd pause for three seconds like he's calculating the optimal response for maximum voter appeal.",
    "Romney said his job wasn't to worry about the 47 percent. Well, that's convenient. My job isn't to worry about the 53 percent. See? We can all pick numbers and decide not to worry about people.",
    "They say Romney was out of touch with regular Americans. I don't think that's fair. He knew exactly what regular Americans were like. He'd read about them in reports. Very detailed reports. Probably kept them in binders.",
    "Romney's secret weapon was supposed to be his business experience. Yeah, his experience buying companies and shutting them down. That's like hiring a divorce lawyer to perform your wedding ceremony.",
    "You know what's funny about Romney? He spent years trying to convince people he was just a regular guy, but he couldn't help mentioning his multiple houses and cars. It's like, 'I'm just like you, except I have eight of everything you have.'",
    "Romney would try to relate to working-class voters by talking about his father. 'My dad started with nothing.' Yeah, and then he became the CEO of American Motors. That's not a rags-to-riches story, that's a riches-to-more-riches story.",
    "They say Romney had perfect hair. Too perfect. It looked like it was made in a factory. In China. By one of his companies. Before he shut it down.",
    "Romney's campaign spent millions on advisors to make him seem more relatable. You know what would have made him more relatable? Not needing millions of dollars worth of advice on how to seem like a normal person.",
    "At the end of the day, Mitt Romney lost to Barack Obama. You know what that tells me? Even America thought Obama was the safer choice. And Obama's middle name is Hussein. Think about that.",
    "Romney tried to appeal to Hispanic voters by joking that he wished his father had been born in Mexico. Yeah, because nothing says 'I understand your struggles' like wishing your millionaire father had been born in a different country for tax advantages.",
    "You know what Romney's campaign needed? More cowbell. No wait, that's not right. More authenticity. But they tried to manufacture authenticity, which is like trying to fake being genuine. You can't fake being real. That's the whole point of being real.",
    "Romney said he could create 12 million jobs. Twelve million jobs. You know how many jobs I've created? Zero. But I've also never destroyed any jobs by strapping them to the roof of my car and driving them to Canada."
];

class JokeApp {
    constructor() {
        this.currentJokeIndex = 0;
        this.totalJokes = jokes.length;
        this.isTransitioning = false;

        // Get DOM elements
        this.jokeTextElement = document.getElementById('joke-text');
        this.currentIndexElement = document.getElementById('current-index');
        this.totalJokesElement = document.getElementById('total-jokes');
        this.prevButton = document.getElementById('prev-btn');
        this.nextButton = document.getElementById('next-btn');

        // Initialize the app
        this.init();
    }

    init() {
        // Set total jokes
        this.totalJokesElement.textContent = this.totalJokes;

        // Display the first joke
        this.displayCurrentJoke();

        // Add event listeners
        this.prevButton.addEventListener('click', () => this.previousJoke());
        this.nextButton.addEventListener('click', () => this.nextJoke());

        // Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.isTransitioning) return; // Prevent rapid key presses during transitions

            if (e.key === 'ArrowLeft' && !this.prevButton.disabled) {
                this.previousJoke();
            } else if (e.key === 'ArrowRight' && !this.nextButton.disabled) {
                this.nextJoke();
            }
        });
    }

    displayCurrentJoke() {
        if (this.isTransitioning) return;

        this.isTransitioning = true;

        // Add smooth fade out effect
        this.jokeTextElement.style.transition = 'opacity 0.3s ease-out';
        this.jokeTextElement.style.opacity = '0';

        setTimeout(() => {
            // Update joke text
            this.jokeTextElement.textContent = jokes[this.currentJokeIndex];

            // Update counter
            this.currentIndexElement.textContent = this.currentJokeIndex + 1;

            // Update button states
            this.updateButtonStates();

            // Fade everything back in
            this.jokeTextElement.style.transition = 'opacity 0.4s ease-in';
            this.jokeTextElement.style.opacity = '1';

            // Reset transition flag after animation completes
            setTimeout(() => {
                this.isTransitioning = false;
            }, 400);
        }, 300);
    }

    updateButtonStates() {
        // Disable/enable previous button
        this.prevButton.disabled = this.currentJokeIndex === 0;

        // Disable/enable next button
        this.nextButton.disabled = this.currentJokeIndex === this.totalJokes - 1;

        // Add visual feedback for button state changes
        if (this.prevButton.disabled) {
            this.prevButton.style.transform = 'none';
        }
        if (this.nextButton.disabled) {
            this.nextButton.style.transform = 'none';
        }
    }

    nextJoke() {
        if (this.isTransitioning || this.currentJokeIndex >= this.totalJokes - 1) return;

        this.currentJokeIndex++;
        this.displayCurrentJoke();

        // Add subtle button feedback
        this.nextButton.style.transform = 'scale(0.95)';
        setTimeout(() => {
            if (!this.nextButton.disabled) {
                this.nextButton.style.transform = '';
            }
        }, 150);
    }

    previousJoke() {
        if (this.isTransitioning || this.currentJokeIndex <= 0) return;

        this.currentJokeIndex--;
        this.displayCurrentJoke();

        // Add subtle button feedback
        this.prevButton.style.transform = 'scale(0.95)';
        setTimeout(() => {
            if (!this.prevButton.disabled) {
                this.prevButton.style.transform = '';
            }
        }, 150);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNav();
    initFooterQuote();
    new JokeApp();
});
