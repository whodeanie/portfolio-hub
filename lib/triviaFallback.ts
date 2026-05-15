// Pre baked trivia questions used when Groq is unavailable.
// Hand written so the game ALWAYS works. Five to ten questions per sport
// for the most popular sports. Sports without a pack get a graceful
// "try again in a moment" message in the page.

export type TriviaQuestion = {
  q: string;
  choices: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  fact?: string;
};

export type FallbackPack = {
  sport: string;
  questions: TriviaQuestion[];
};

// Sport ids match the keys in sports-trivia/page.tsx SPORTS list.
export const FALLBACK_PACKS: Record<string, TriviaQuestion[]> = {
  nba: [
    {
      q: "Who holds the NBA single game scoring record with 100 points?",
      choices: ["Wilt Chamberlain", "Kobe Bryant", "Michael Jordan", "Elgin Baylor"],
      correct: 0,
      fact: "Wilt Chamberlain dropped 100 on the New York Knicks on March 2, 1962.",
    },
    {
      q: "Which team did Tim Duncan play his entire NBA career with?",
      choices: ["Houston Rockets", "Dallas Mavericks", "San Antonio Spurs", "Phoenix Suns"],
      correct: 2,
      fact: "Duncan played 19 seasons in San Antonio and won 5 championships.",
    },
    {
      q: "Who was named NBA Finals MVP in 2023?",
      choices: ["Nikola Jokic", "Jamal Murray", "LeBron James", "Jimmy Butler"],
      correct: 0,
      fact: "Jokic was the first center to win Finals MVP since Shaquille O'Neal in 2002.",
    },
    {
      q: "How many championships did Bill Russell win with the Boston Celtics?",
      choices: ["8", "9", "10", "11"],
      correct: 3,
      fact: "Russell won 11 titles in 13 seasons, the most by any NBA player.",
    },
    {
      q: "Which player has the most career NBA assists?",
      choices: ["Magic Johnson", "John Stockton", "Chris Paul", "Jason Kidd"],
      correct: 1,
      fact: "John Stockton finished with 15,806 assists, more than 3,500 ahead of second place.",
    },
    {
      q: "What was the name of the original Charlotte NBA franchise that moved to New Orleans in 2002?",
      choices: ["Hornets", "Bobcats", "Pelicans", "Royals"],
      correct: 0,
      fact: "The Hornets relocated, then Charlotte got the Bobcats expansion team in 2004.",
    },
    {
      q: "Who is the all time leading scorer in NBA history as of 2024?",
      choices: ["Kareem Abdul Jabbar", "LeBron James", "Karl Malone", "Kobe Bryant"],
      correct: 1,
      fact: "LeBron passed Kareem on February 7, 2023, and kept extending the record.",
    },
    {
      q: "Which team drafted Kobe Bryant before trading him to the Lakers?",
      choices: ["Philadelphia 76ers", "Charlotte Hornets", "New Jersey Nets", "Toronto Raptors"],
      correct: 1,
      fact: "Charlotte drafted Kobe 13th overall in 1996 and traded him for Vlade Divac.",
    },
  ],
  nfl: [
    {
      q: "Which quarterback has the most Super Bowl wins?",
      choices: ["Tom Brady", "Joe Montana", "Terry Bradshaw", "Patrick Mahomes"],
      correct: 0,
      fact: "Brady won 7 Super Bowls, more than any team in NFL history.",
    },
    {
      q: "Which team won Super Bowl LVII in February 2023?",
      choices: ["Philadelphia Eagles", "Kansas City Chiefs", "Cincinnati Bengals", "San Francisco 49ers"],
      correct: 1,
      fact: "The Chiefs beat the Eagles 38 to 35 in Glendale, Arizona.",
    },
    {
      q: "Who holds the NFL single season passing yards record?",
      choices: ["Peyton Manning", "Drew Brees", "Patrick Mahomes", "Tom Brady"],
      correct: 0,
      fact: "Manning threw for 5,477 yards in 2013 with the Denver Broncos.",
    },
    {
      q: "What was the only undefeated team in NFL history?",
      choices: ["1985 Bears", "1972 Dolphins", "2007 Patriots", "1962 Packers"],
      correct: 1,
      fact: "Miami went 17 and 0 including the playoffs and Super Bowl VII.",
    },
    {
      q: "Which running back rushed for an NFL record 2,105 yards in a season?",
      choices: ["Eric Dickerson", "Adrian Peterson", "Barry Sanders", "Jim Brown"],
      correct: 0,
      fact: "Dickerson set the mark with the Rams in 1984.",
    },
    {
      q: "What city hosts the Pro Football Hall of Fame?",
      choices: ["Cooperstown", "Springfield", "Canton", "Cleveland"],
      correct: 2,
      fact: "Canton, Ohio is where the NFL was founded in 1920.",
    },
    {
      q: "Which receiver holds the NFL career receiving yards record?",
      choices: ["Jerry Rice", "Larry Fitzgerald", "Terrell Owens", "Randy Moss"],
      correct: 0,
      fact: "Rice finished with 22,895 receiving yards, far ahead of anyone else.",
    },
  ],
  mlb: [
    {
      q: "Who broke Roger Maris's single season home run record in 1998?",
      choices: ["Mark McGwire", "Sammy Sosa", "Barry Bonds", "Ken Griffey Jr"],
      correct: 0,
      fact: "McGwire hit 70 home runs that season. Sosa hit 66.",
    },
    {
      q: "Who holds the MLB career home run record?",
      choices: ["Hank Aaron", "Babe Ruth", "Barry Bonds", "Albert Pujols"],
      correct: 2,
      fact: "Bonds finished with 762 home runs in his career.",
    },
    {
      q: "Which team won the 2023 World Series?",
      choices: ["Houston Astros", "Texas Rangers", "Atlanta Braves", "Arizona Diamondbacks"],
      correct: 1,
      fact: "The Rangers beat the Diamondbacks in five games for their first ever title.",
    },
    {
      q: "How many games are there in a regulation MLB regular season?",
      choices: ["154", "162", "172", "180"],
      correct: 1,
      fact: "MLB expanded from 154 to 162 games in the early 1960s.",
    },
    {
      q: "Who was the first player to break the MLB color barrier?",
      choices: ["Larry Doby", "Satchel Paige", "Jackie Robinson", "Hank Aaron"],
      correct: 2,
      fact: "Robinson debuted with the Brooklyn Dodgers on April 15, 1947.",
    },
    {
      q: "Which team has won the most World Series championships?",
      choices: ["Boston Red Sox", "Los Angeles Dodgers", "St Louis Cardinals", "New York Yankees"],
      correct: 3,
      fact: "The Yankees have 27 World Series titles, more than double any other team.",
    },
    {
      q: "Who has the most career hits in MLB history?",
      choices: ["Ty Cobb", "Pete Rose", "Hank Aaron", "Stan Musial"],
      correct: 1,
      fact: "Rose collected 4,256 hits during his playing career.",
    },
  ],
  nhl: [
    {
      q: "Who holds the NHL career goals record?",
      choices: ["Wayne Gretzky", "Gordie Howe", "Brett Hull", "Alex Ovechkin"],
      correct: 0,
      fact: "Gretzky scored 894 goals. Ovechkin has been chasing that mark.",
    },
    {
      q: "Which team has won the most Stanley Cup championships?",
      choices: ["Toronto Maple Leafs", "Detroit Red Wings", "Montreal Canadiens", "Boston Bruins"],
      correct: 2,
      fact: "Montreal has 24 Stanley Cup titles, the most in the NHL.",
    },
    {
      q: "How many points did Wayne Gretzky score in his record 1985 86 season?",
      choices: ["208", "215", "220", "215"],
      correct: 1,
      fact: "Gretzky put up 215 points that year for the Edmonton Oilers.",
    },
    {
      q: "Which team won the 2023 Stanley Cup?",
      choices: ["Vegas Golden Knights", "Florida Panthers", "Tampa Bay Lightning", "Colorado Avalanche"],
      correct: 0,
      fact: "Vegas beat Florida in five games for their first championship.",
    },
    {
      q: "Who is known as Mr Hockey?",
      choices: ["Bobby Orr", "Wayne Gretzky", "Mario Lemieux", "Gordie Howe"],
      correct: 3,
      fact: "Howe earned the nickname over a 26 year NHL career.",
    },
    {
      q: "How many players from each team are on the ice during play?",
      choices: ["5", "6", "7", "8"],
      correct: 1,
      fact: "Six per side counting the goalie, five skaters during a power play kill is common.",
    },
  ],
  soccer: [
    {
      q: "Which country won the 2022 FIFA World Cup?",
      choices: ["France", "Argentina", "Brazil", "Croatia"],
      correct: 1,
      fact: "Argentina beat France on penalties in Qatar with Messi as captain.",
    },
    {
      q: "Which club has won the most UEFA Champions League titles?",
      choices: ["Bayern Munich", "Liverpool", "AC Milan", "Real Madrid"],
      correct: 3,
      fact: "Real Madrid has 14 European Cup titles as of 2024.",
    },
    {
      q: "Who holds the record for most international goals in mens football?",
      choices: ["Lionel Messi", "Cristiano Ronaldo", "Ali Daei", "Sunil Chhetri"],
      correct: 1,
      fact: "Ronaldo passed Daei in 2021 and has kept extending the record.",
    },
    {
      q: "Which team won the 2023 24 English Premier League title?",
      choices: ["Arsenal", "Manchester City", "Liverpool", "Chelsea"],
      correct: 1,
      fact: "City won their fourth straight Premier League title in 2024.",
    },
    {
      q: "Which player won the 2023 Ballon d'Or?",
      choices: ["Erling Haaland", "Kylian Mbappe", "Lionel Messi", "Kevin De Bruyne"],
      correct: 2,
      fact: "Messi won his eighth Ballon d'Or after the 2022 World Cup victory.",
    },
    {
      q: "How many minutes are in a regulation soccer match?",
      choices: ["80", "90", "100", "120"],
      correct: 1,
      fact: "Two 45 minute halves with stoppage added at the referee's discretion.",
    },
    {
      q: "Which MLS franchise has won the most MLS Cups?",
      choices: ["LA Galaxy", "DC United", "Houston Dynamo", "Seattle Sounders"],
      correct: 0,
      fact: "The Galaxy have 5 MLS Cup titles, the most in league history.",
    },
  ],
  "ncaa-football": [
    {
      q: "Which school has won the most consensus college football national championships?",
      choices: ["Alabama", "Notre Dame", "Princeton", "Ohio State"],
      correct: 2,
      fact: "Princeton claims more 19th century titles than anyone, with 28 in some counts.",
    },
    {
      q: "Who won the Heisman Trophy in 2022?",
      choices: ["Caleb Williams", "CJ Stroud", "Bryce Young", "Max Duggan"],
      correct: 0,
      fact: "Caleb Williams won at USC after transferring from Oklahoma.",
    },
    {
      q: "Which team won the 2023 24 College Football Playoff National Championship?",
      choices: ["Georgia", "Michigan", "Washington", "Texas"],
      correct: 1,
      fact: "Michigan beat Washington 34 to 13 in Houston for their first title since 1997.",
    },
    {
      q: "What is the oldest college football rivalry trophy in continuous play?",
      choices: ["Old Oaken Bucket", "Little Brown Jug", "Floyd of Rosedale", "Old Brass Spittoon"],
      correct: 1,
      fact: "Minnesota and Michigan have played for the Little Brown Jug since 1909.",
    },
    {
      q: "Which conference did Texas and Oklahoma join in 2024?",
      choices: ["ACC", "Big Ten", "SEC", "Pac 12"],
      correct: 2,
      fact: "Both schools moved from the Big 12 to the SEC in the 2024 season.",
    },
    {
      q: "Who is the only player to win the Heisman Trophy twice?",
      choices: ["Tim Tebow", "Archie Griffin", "Herschel Walker", "Bo Jackson"],
      correct: 1,
      fact: "Griffin won at Ohio State in 1974 and 1975.",
    },
  ],
};

export function hasFallback(sportId: string): boolean {
  return Array.isArray(FALLBACK_PACKS[sportId]) && FALLBACK_PACKS[sportId].length >= 5;
}

export function getFallbackQuestions(sportId: string): TriviaQuestion[] | null {
  if (!hasFallback(sportId)) return null;
  const pool = FALLBACK_PACKS[sportId];
  // Shuffle and take up to 10. If pool is smaller, repeat with shuffle.
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const out: TriviaQuestion[] = [];
  while (out.length < 10) {
    for (const q of shuffled) {
      if (out.length >= 10) break;
      out.push(q);
    }
  }
  return out.slice(0, 10);
}
