<?php

namespace App\Doctrine\Functions;

use Doctrine\DBAL\Platforms\AbstractPlatform;
use Doctrine\DBAL\Platforms\OraclePlatform;
use Doctrine\DBAL\Platforms\SQLServerPlatform;
use Doctrine\ORM\Query\AST\Functions\FunctionNode;
use Doctrine\ORM\Query\TokenType;
use Doctrine\ORM\Query\Parser;
use Doctrine\ORM\Query\SqlWalker;

class Date extends FunctionNode {
    public $date;

    public function getSql(SqlWalker $sqlWalker): string {
        return $this->getFunctionByPlatform(
            $sqlWalker->getConnection()->getDatabasePlatform(),
            $sqlWalker->walkArithmeticPrimary($this->date),
        );
    }

    public function parse(Parser $parser): void {
        $parser->match(TokenType::T_IDENTIFIER);
        $parser->match(TokenType::T_OPEN_PARENTHESIS);

        $this->date = $parser->ArithmeticPrimary();

        $parser->match(TokenType::T_CLOSE_PARENTHESIS);
    }

    private function getFunctionByPlatform(AbstractPlatform $platform, string $date): string {
        return match (true) {
            $platform instanceof OraclePlatform => \sprintf("TO_DATE(%s, 'YYYY-MON-DD')", $date),
            $platform instanceof SQLServerPlatform => \sprintf('CONVERT(VARCHAR, %s, 23)', $date),
            default => \sprintf('DATE(%s)', $date),
        };
    }
}
